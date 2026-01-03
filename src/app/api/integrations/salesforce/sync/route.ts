import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { integrations, documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createSalesforceClient,
  type SalesforceIntegrationMetadata,
  type SalesforceTokens,
  type SalesforceSyncSettings,
} from "@/lib/salesforce";

interface SyncRequest {
  documentId: string;
  eventType: "signed" | "completed" | "viewed" | "sent";
  opportunityId?: string;
  accountId?: string;
  contactId?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

/**
 * Sync document events to Salesforce
 *
 * This endpoint is called when document events occur (signed, completed, etc.)
 * to update Salesforce records accordingly.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: SyncRequest = await request.json();
    const {
      documentId,
      eventType,
      opportunityId,
      accountId,
      contactId,
      pdfBase64,
      pdfFileName,
    } = body;

    if (!documentId || !eventType) {
      return NextResponse.json(
        { error: "documentId and eventType are required" },
        { status: 400 }
      );
    }

    // Get integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, "salesforce")
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: "Salesforce not connected" },
        { status: 400 }
      );
    }

    const metadata = integration.metadata as unknown as SalesforceIntegrationMetadata | null;
    const isSandbox = metadata?.isSandbox || false;
    const syncSettings: SalesforceSyncSettings = metadata?.syncSettings || {
      updateOpportunityOnSign: true,
      signedOpportunityStage: "Closed Won",
      createTaskOnComplete: true,
      taskSubject: "Document signed - follow up required",
      taskPriority: "Normal",
      attachDocumentToOpportunity: true,
      attachDocumentToAccount: false,
      fieldMappings: [],
    };

    // Get document info
    const document = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id)
      ),
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Create tokens object
    const tokens: SalesforceTokens = {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || "",
      instanceUrl: integration.accountId || "",
      expiresAt: integration.tokenExpiresAt || new Date(Date.now() + 60 * 60 * 1000),
    };

    // Create client with token refresh callback
    const client = createSalesforceClient(
      tokens,
      async (newTokens) => {
        await db
          .update(integrations)
          .set({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            tokenExpiresAt: newTokens.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      },
      isSandbox
    );

    const results: {
      opportunityUpdated?: boolean;
      taskCreated?: boolean;
      taskId?: string;
      attachmentCreated?: boolean;
      attachmentId?: string;
      errors: string[];
    } = {
      errors: [],
    };

    // Handle signed/completed events
    if (eventType === "signed" || eventType === "completed") {
      // Update opportunity stage
      if (opportunityId && syncSettings.updateOpportunityOnSign) {
        try {
          await client.updateOpportunity(opportunityId, {
            StageName: syncSettings.signedOpportunityStage,
          });
          results.opportunityUpdated = true;
        } catch (error) {
          console.error("Failed to update opportunity:", error);
          results.errors.push(
            `Failed to update opportunity: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      // Create follow-up task
      if (syncSettings.createTaskOnComplete && (opportunityId || accountId || contactId)) {
        try {
          const today = new Date();
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

          const taskResult = await client.createTask({
            Subject: syncSettings.taskSubject || `Follow up: ${document.title}`,
            Status: "Not Started",
            Priority: syncSettings.taskPriority || "Normal",
            ActivityDate: dueDate.toISOString().split("T")[0], // YYYY-MM-DD
            Description: `Document "${document.title}" was ${eventType} on ${new Date().toLocaleDateString()}.\n\nThis task was automatically created by OpenProposal.`,
            WhatId: opportunityId || accountId || undefined,
            WhoId: contactId || undefined,
          });
          results.taskCreated = true;
          results.taskId = taskResult.id;
        } catch (error) {
          console.error("Failed to create task:", error);
          results.errors.push(
            `Failed to create task: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      // Attach document to Salesforce
      if (pdfBase64 && pdfFileName) {
        const attachToId = syncSettings.attachDocumentToOpportunity
          ? opportunityId
          : syncSettings.attachDocumentToAccount
            ? accountId
            : null;

        if (attachToId) {
          try {
            const attachmentResult = await client.addAttachment(
              attachToId,
              pdfFileName,
              pdfBase64,
              document.title,
              `Signed document from OpenProposal. ${eventType.charAt(0).toUpperCase() + eventType.slice(1)} on ${new Date().toLocaleDateString()}.`
            );
            results.attachmentCreated = true;
            results.attachmentId = attachmentResult.id;
          } catch (error) {
            console.error("Failed to attach document:", error);
            results.errors.push(
              `Failed to attach document: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      }
    }

    // Update last sync time
    await db
      .update(integrations)
      .set({ updatedAt: new Date() })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: results.errors.length === 0,
      ...results,
    });
  } catch (error) {
    console.error("Failed to sync to Salesforce:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}

/**
 * Update sync settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Partial<SalesforceSyncSettings> = await request.json();

    // Get integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, "salesforce")
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Salesforce not connected" },
        { status: 400 }
      );
    }

    const metadata = (integration.metadata as unknown as SalesforceIntegrationMetadata) || {} as SalesforceIntegrationMetadata;
    const currentSettings: SalesforceSyncSettings = metadata.syncSettings || {
      updateOpportunityOnSign: true,
      signedOpportunityStage: "Closed Won",
      createTaskOnComplete: true,
      taskSubject: "Document signed - follow up required",
      taskPriority: "Normal",
      attachDocumentToOpportunity: true,
      attachDocumentToAccount: false,
      fieldMappings: [],
    };

    // Merge settings
    const newSettings: SalesforceSyncSettings = {
      ...currentSettings,
      ...body,
    };

    const newMetadata: SalesforceIntegrationMetadata = {
      ...metadata,
      syncSettings: newSettings,
    };

    // Update integration
    await db
      .update(integrations)
      .set({
        metadata: newMetadata as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: true,
      syncSettings: newSettings,
    });
  } catch (error) {
    console.error("Failed to update Salesforce sync settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
