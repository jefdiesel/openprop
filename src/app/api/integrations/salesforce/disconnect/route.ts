import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revokeToken } from "@/lib/salesforce";
import type { SalesforceIntegrationMetadata } from "@/lib/salesforce";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, "salesforce")
      ),
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const metadata = integration.metadata as SalesforceIntegrationMetadata | null;
    const isSandbox = metadata?.isSandbox || false;

    // Optionally revoke the token at Salesforce
    if (integration.accessToken) {
      try {
        await revokeToken(integration.accessToken, isSandbox);
      } catch (error) {
        console.error("Failed to revoke Salesforce token:", error);
        // Continue with deletion even if revocation fails
      }
    }

    // Also try to revoke refresh token
    if (integration.refreshToken) {
      try {
        await revokeToken(integration.refreshToken, isSandbox);
      } catch (error) {
        console.error("Failed to revoke Salesforce refresh token:", error);
        // Continue with deletion even if revocation fails
      }
    }

    // Delete the integration
    await db.delete(integrations).where(eq(integrations.id, integration.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disconnect Salesforce:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
