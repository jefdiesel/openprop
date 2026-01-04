import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getCurrentOrganization,
  switchOrganizationContext,
  getUserOrganizations,
} from "@/lib/organizations";

// GET /api/context - Get current organization context
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [currentOrg, organizations] = await Promise.all([
      getCurrentOrganization(session.user.id),
      getUserOrganizations(session.user.id),
    ]);

    return NextResponse.json({
      currentOrganization: currentOrg,
      organizations,
      isPersonalContext: !currentOrg,
    });
  } catch (error) {
    console.error("Error fetching context:", error);
    return NextResponse.json(
      { error: "Failed to fetch context" },
      { status: 500 }
    );
  }
}

// PUT /api/context - Switch organization context
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    // organizationId can be null to switch to personal context
    const success = await switchOrganizationContext(
      session.user.id,
      organizationId || null
    );

    if (!success) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Fetch the new current org to return
    const currentOrg = organizationId
      ? await getCurrentOrganization(session.user.id)
      : null;

    return NextResponse.json({
      success: true,
      currentOrganization: currentOrg,
      isPersonalContext: !currentOrg,
    });
  } catch (error) {
    console.error("Error switching context:", error);
    return NextResponse.json(
      { error: "Failed to switch context" },
      { status: 500 }
    );
  }
}
