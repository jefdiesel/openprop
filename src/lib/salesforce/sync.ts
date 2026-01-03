/**
 * Salesforce Sync Helper
 *
 * Helper functions to sync OpenProposal document events to Salesforce CRM
 */

import { db } from "@/lib/db";
import { integrations, documents as documentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createSalesforceClient } from "./client";
import type {
  SalesforceIntegrationMetadata,
  SalesforceTokens,
  SalesforceSyncSettings,
} from "./types";

export interface DocumentSyncData {
  documentId: string;
  userId: string;
  eventType: "signed" | "completed" | "viewed" | "sent";
  opportunityId?: string;
  accountId?: string;
  contactId?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

export interface SyncResult {
  success: boolean;
  opportunityUpdated?: boolean;
  taskCreated?: boolean;
  taskId?: string;
  attachmentCreated?: boolean;
  attachmentId?: string;
  errors: string[];
}

/**
 * Sync a document event to Salesforce
 *
 * This should be called when document events occur (signed, completed, etc.)
 */
export async function syncDocumentToSalesforce(
  data: DocumentSyncData
): Promise<SyncResult | null> {
  const {
    documentId,
    userId,
    eventType,
    opportunityId,
    accountId,
    contactId,
    pdfBase64,
    pdfFileName,
  } = data;

  // Get Salesforce integration for this user
  const integration = await db.query.integrations.findFirst({
    where: and(
      eq(integrations.userId, userId),
      eq(integrations.provider, "salesforce")
    ),
  });

  // If no integration, skip silently
  if (!integration || !integration.accessToken) {
    return null;
  }

  const metadata = integration.metadata as SalesforceIntegrationMetadata | null;
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
    where: eq(documentsTable.id, documentId),
  });

  if (!document) {
    return { success: false, errors: ["Document not found"] };
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

  const results: SyncResult = {
    success: true,
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
          ActivityDate: dueDate.toISOString().split("T")[0],
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

  results.success = results.errors.length === 0;
  return results;
}

/**
 * Check if a user has Salesforce connected
 */
export async function hasSalesforceIntegration(userId: string): Promise<boolean> {
  const integration = await db.query.integrations.findFirst({
    where: and(
      eq(integrations.userId, userId),
      eq(integrations.provider, "salesforce")
    ),
  });

  return !!integration?.accessToken;
}

/**
 * Get Salesforce sync settings for a user
 */
export async function getSalesforceSyncSettings(
  userId: string
): Promise<SalesforceSyncSettings | null> {
  const integration = await db.query.integrations.findFirst({
    where: and(
      eq(integrations.userId, userId),
      eq(integrations.provider, "salesforce")
    ),
  });

  if (!integration) {
    return null;
  }

  const metadata = integration.metadata as SalesforceIntegrationMetadata | null;
  return metadata?.syncSettings || null;
}
