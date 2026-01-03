import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createSalesforceClient,
  type SalesforceIntegrationMetadata,
  type SalesforceTokens,
} from "@/lib/salesforce";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const metadata = integration.metadata as SalesforceIntegrationMetadata | null;
    const isSandbox = metadata?.isSandbox || false;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const openOnly = searchParams.get("open") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 25;

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
        // Update tokens in database
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

    // Fetch opportunities
    const opportunities = openOnly
      ? await client.listOpenOpportunities(limit)
      : await client.listOpportunities(limit);

    // Transform to a simpler format for the frontend
    const formattedOpportunities = opportunities.map((opp) => ({
      id: opp.Id,
      name: opp.Name,
      stage: opp.StageName,
      amount: opp.Amount,
      closeDate: opp.CloseDate,
      probability: opp.Probability,
      type: opp.Type || null,
      accountId: opp.AccountId || null,
      accountName: opp.Account?.Name || null,
      isClosed: opp.IsClosed || false,
      isWon: opp.IsWon || false,
    }));

    return NextResponse.json({
      opportunities: formattedOpportunities,
      total: formattedOpportunities.length,
    });
  } catch (error) {
    console.error("Failed to fetch Salesforce opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
