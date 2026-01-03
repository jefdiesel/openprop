import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { earlyBirdSlots } from "@/lib/db/schema"
import { count } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get count of claimed slots
    const [{ total }] = await db.select({ total: count() }).from(earlyBirdSlots)

    const claimed = total || 0
    const totalSlots = 100
    const remaining = totalSlots - claimed

    return NextResponse.json({
      total: totalSlots,
      claimed,
      remaining,
      available: remaining > 0,
    })
  } catch (error) {
    console.error("Early bird check error:", error)
    return NextResponse.json(
      { error: "Failed to check early bird status" },
      { status: 500 }
    )
  }
}
