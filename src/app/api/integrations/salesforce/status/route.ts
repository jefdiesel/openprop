import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { SalesforceIntegrationMetadata } from "@/lib/salesforce";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, "salesforce")
      ),
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
        orgName: null,
        instanceUrl: null,
        isSandbox: null,
        connectedAt: null,
        lastSync: null,
      });
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    const metadata = integration.metadata as SalesforceIntegrationMetadata | null;

    return NextResponse.json({
      connected: !isTokenExpired,
      orgName: metadata?.orgName || null,
      orgId: metadata?.orgId || null,
      instanceUrl: integration.accountId || null,
      userName: metadata?.userName || null,
      userEmail: metadata?.userEmail || integration.accountEmail || null,
      isSandbox: metadata?.isSandbox || false,
      connectedAt: metadata?.connectedAt || integration.createdAt.toISOString(),
      lastSync: integration.updatedAt.toISOString(),
      tokenExpired: isTokenExpired,
      syncSettings: metadata?.syncSettings || null,
    });
  } catch (error) {
    console.error("Failed to get Salesforce status:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
