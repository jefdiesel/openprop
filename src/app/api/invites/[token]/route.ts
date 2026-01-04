import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInviteByToken, acceptInvite } from "@/lib/organizations";

// GET /api/invites/[token] - Get invite details (public, for accept page)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  try {
    const invite = await getInviteByToken(token);

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invite: {
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        organization: {
          id: invite.organizationId,
          name: invite.organizationName,
          logoUrl: invite.organizationLogo,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

// POST /api/invites/[token] - Accept invite
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 }
      );
    }

    const invite = await getInviteByToken(token);
    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Optionally verify email matches (but allow flexibility)
    // For now, any authenticated user can accept an invite sent to them

    const result = await acceptInvite(token, session.user.id);

    return NextResponse.json({
      success: true,
      organization: {
        id: result.organizationId,
        name: result.organizationName,
      },
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    const message =
      error instanceof Error ? error.message : "Failed to accept invitation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
