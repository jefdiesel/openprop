import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  exchangeCodeForTokens,
  decodeStateData,
  isStateValid,
  SalesforceClient,
  type SalesforceIntegrationMetadata,
} from "@/lib/salesforce";

const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SALESFORCE_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
const SALESFORCE_REDIRECT_URI =
  process.env.SALESFORCE_REDIRECT_URI ||
  `${process.env.NEXTAUTH_URL}/api/integrations/salesforce/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("Salesforce OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/settings/integrations/salesforce?error=oauth_denied&message=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings/integrations/salesforce?error=missing_params", request.url)
      );
    }

    // Decode and validate state
    const stateData = decodeStateData(state);
    if (!stateData) {
      return NextResponse.redirect(
        new URL("/settings/integrations/salesforce?error=invalid_state", request.url)
      );
    }

    // Verify state is not too old (10 minutes)
    if (!isStateValid(stateData.timestamp)) {
      return NextResponse.redirect(
        new URL("/settings/integrations/salesforce?error=state_expired", request.url)
      );
    }

    const userId = stateData.userId;
    const isSandbox = stateData.isSandbox;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/settings/integrations/salesforce?error=invalid_user", request.url)
      );
    }

    // Exchange code for tokens
    let tokens;
    try {
      tokens = await exchangeCodeForTokens(
        {
          clientId: SALESFORCE_CLIENT_ID!,
          clientSecret: SALESFORCE_CLIENT_SECRET!,
          redirectUri: SALESFORCE_REDIRECT_URI,
        },
        code,
        isSandbox
      );
    } catch (error) {
      console.error("Failed to exchange code for tokens:", error);
      return NextResponse.redirect(
        new URL(
          "/settings/integrations/salesforce?error=token_exchange_failed",
          request.url
        )
      );
    }

    // Get organization info from Salesforce
    let orgInfo: { name?: string; id?: string; userName?: string; userEmail?: string } =
      {};
    try {
      const client = new SalesforceClient({
        accessToken: tokens.accessToken,
        instanceUrl: tokens.instanceUrl,
      });

      const org = await client.getOrganization();
      orgInfo.name = org.Name;
      orgInfo.id = org.Id;

      // Try to get current user info
      if (tokens.userId) {
        try {
          const user = await client.getUser(tokens.userId);
          orgInfo.userName = user.Name;
          orgInfo.userEmail = user.Email;
        } catch {
          // User info is optional
        }
      }
    } catch (error) {
      console.error("Failed to fetch Salesforce org info:", error);
      // Continue with connection even if org info fails
    }

    // Calculate token expiration
    const tokenExpiresAt = tokens.expiresAt;

    // Build metadata
    const metadata: SalesforceIntegrationMetadata = {
      orgName: orgInfo.name,
      orgId: orgInfo.id,
      isSandbox,
      connectedAt: new Date().toISOString(),
      userName: orgInfo.userName,
      userEmail: orgInfo.userEmail,
      syncSettings: {
        updateOpportunityOnSign: true,
        signedOpportunityStage: "Closed Won",
        createTaskOnComplete: true,
        taskSubject: "Document signed - follow up required",
        taskPriority: "Normal",
        attachDocumentToOpportunity: true,
        attachDocumentToAccount: false,
        fieldMappings: [],
      },
    };

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, "salesforce")
      ),
    });

    if (existingIntegration) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt,
          scope: "api refresh_token offline_access id",
          accountEmail: orgInfo.userEmail || null,
          accountId: tokens.instanceUrl, // Store instance URL as accountId
          metadata: metadata as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: "salesforce",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt,
        scope: "api refresh_token offline_access id",
        accountEmail: orgInfo.userEmail || null,
        accountId: tokens.instanceUrl, // Store instance URL as accountId
        metadata: metadata as unknown as Record<string, unknown>,
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/settings/integrations/salesforce?success=connected", request.url)
    );
  } catch (error) {
    console.error("Salesforce callback error:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations/salesforce?error=callback_failed", request.url)
    );
  }
}
