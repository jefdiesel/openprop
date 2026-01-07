import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch user and profile
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));

  return NextResponse.json({
    user: {
      name: user?.name || "",
      email: user?.email || "",
    },
    profile: {
      companyName: profile?.companyName || "",
      brandColor: profile?.brandColor || "#000000",
      stripeAccountId: profile?.stripeAccountId || null,
      stripeAccountEnabled: profile?.stripeAccountEnabled || false,
      walletAddress: profile?.walletAddress || null,
    },
  });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();

  // Update user name if provided
  if (body.name !== undefined) {
    await db
      .update(users)
      .set({ name: body.name, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Update profile if any profile fields provided
  if (body.companyName !== undefined || body.brandColor !== undefined || body.walletAddress !== undefined) {
    // Validate wallet address format if provided
    if (body.walletAddress !== undefined && body.walletAddress !== null && body.walletAddress !== "") {
      if (!body.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return NextResponse.json(
          { error: "Invalid wallet address format. Must be a valid Ethereum address." },
          { status: 400 }
        );
      }
    }

    // Check if profile exists
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, userId));

    if (existingProfile) {
      await db
        .update(profiles)
        .set({
          ...(body.companyName !== undefined && { companyName: body.companyName }),
          ...(body.brandColor !== undefined && { brandColor: body.brandColor }),
          ...(body.walletAddress !== undefined && { walletAddress: body.walletAddress || null }),
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId));
    } else {
      // Create profile if it doesn't exist
      await db.insert(profiles).values({
        id: userId,
        companyName: body.companyName || null,
        brandColor: body.brandColor || "#000000",
        walletAddress: body.walletAddress || null,
      });
    }
  }

  return NextResponse.json({ success: true });
}
