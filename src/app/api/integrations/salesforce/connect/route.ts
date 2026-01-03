import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateAuthUrl,
  encodeStateData,
  DEFAULT_SALESFORCE_SCOPES,
} from "@/lib/salesforce";

const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SALESFORCE_REDIRECT_URI =
  process.env.SALESFORCE_REDIRECT_URI ||
  `${process.env.NEXTAUTH_URL}/api/integrations/salesforce/callback`;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!SALESFORCE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Salesforce integration not configured" },
        { status: 500 }
      );
    }

    // Check if sandbox mode is requested
    const searchParams = request.nextUrl.searchParams;
    const isSandbox = searchParams.get("sandbox") === "true";

    // Generate state parameter for CSRF protection
    const stateData = {
      userId: session.user.id,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
      isSandbox,
    };
    const state = encodeStateData(stateData);

    // Build Salesforce OAuth authorization URL
    const authUrl = generateAuthUrl(
      {
        clientId: SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET!,
        redirectUri: SALESFORCE_REDIRECT_URI,
      },
      DEFAULT_SALESFORCE_SCOPES,
      state,
      isSandbox
    );

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Failed to initiate Salesforce connection:", error);
    return NextResponse.json(
      { error: "Failed to initiate connection" },
      { status: 500 }
    );
  }
}
