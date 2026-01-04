import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { verificationTokens, users } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import {
  getOrganizationMembers,
  getOrganizationInvites,
  inviteMember,
  getOrganization,
  canAddMember,
} from "@/lib/organizations";
import { requireOrgPermission } from "@/lib/permissions";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// GET /api/organizations/[id]/members - List members and pending invites
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "members:read");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const [members, invites] = await Promise.all([
      getOrganizationMembers(orgId),
      getOrganizationInvites(orgId),
    ]);

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
      invites,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/members - Invite new member
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "members:invite");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { email, role = "member" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'member'" },
        { status: 400 }
      );
    }

    // Check seat limits
    const seatCheck = await canAddMember(orgId);
    if (!seatCheck.allowed) {
      return NextResponse.json(
        { error: seatCheck.reason || "Cannot add more members" },
        { status: 403 }
      );
    }

    const org = await getOrganization(orgId);
    const invite = await inviteMember(
      orgId,
      email,
      role as "admin" | "member",
      authCheck.userId!
    );

    // Check if user already exists
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${invite.token}`;
    let emailSent = false;
    let emailError: string | null = null;

    // Check if user already has an account
    const [existingUser] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (resend && org) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "SendProp <noreply@sendprop.com>";

        if (existingUser) {
          // User exists - send regular invite link (they can log in normally)
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `You've been invited to join ${org.name} on SendProp`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">You're invited!</h1>
                <p>You've been invited to join <strong>${org.name}</strong> on SendProp as a ${role}.</p>
                <p>
                  <a href="${inviteUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Accept Invitation
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  This invitation will expire in 7 days.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #999; font-size: 12px;">
                  If you didn't expect this invitation, you can ignore this email.
                </p>
              </div>
            `,
          });
        } else {
          // New user - send magic link that creates account AND redirects to invite
          const rawToken = uuidv4();
          const hashedToken = createHash("sha256")
            .update(`${rawToken}${process.env.AUTH_SECRET || ""}`)
            .digest("hex");
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await db.insert(verificationTokens).values({
            identifier: email.toLowerCase(),
            token: hashedToken,
            expires,
          });

          const callbackUrl = encodeURIComponent(`/invite/${invite.token}`);
          const magicLinkUrl = `${baseUrl}/api/auth/callback/resend?token=${rawToken}&email=${encodeURIComponent(email)}&callbackUrl=${callbackUrl}`;

          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `You've been invited to join ${org.name} on SendProp`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">You're invited!</h1>
                <p>You've been invited to join <strong>${org.name}</strong> on SendProp as a ${role}.</p>
                <p>
                  <a href="${magicLinkUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Accept Invitation
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 24 hours.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #999; font-size: 12px;">
                  If you didn't expect this invitation, you can ignore this email.
                </p>
              </div>
            `,
          });
        }
        emailSent = true;
      } catch (err) {
        console.error("Failed to send invite email:", err);
        emailError = err instanceof Error ? err.message : "Email send failed";
      }
    } else if (!resend) {
      emailError = "Email not configured (RESEND_API_KEY missing)";
    }

    return NextResponse.json({
      invite,
      inviteUrl, // Fallback URL if email fails
      emailSent,
      emailError,
    }, { status: 201 });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
