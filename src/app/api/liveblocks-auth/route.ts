import { Liveblocks } from "@liveblocks/node"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserColor } from "@/lib/liveblocks.config"

// Lazy initialization - only create client when needed and key is available
function getLiveblocks(): Liveblocks | null {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret || !secret.startsWith("sk_")) {
    return null
  }
  return new Liveblocks({ secret })
}

export async function POST(request: NextRequest) {
  try {
    const liveblocks = getLiveblocks()

    if (!liveblocks) {
      return NextResponse.json(
        { error: "Liveblocks is not configured. Set LIVEBLOCKS_SECRET_KEY in environment." },
        { status: 503 }
      )
    }

    // Get the current user from session
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = session.user
    const userId = user.id || user.email || "anonymous"
    const userName = user.name || user.email || "Anonymous"
    const userEmail = user.email || ""

    // Get room from request body
    const body = await request.json()
    const { room } = body

    if (!room) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      )
    }

    // TODO: Add authorization check
    // Verify user has access to the document (room = document:${documentId})
    // const documentId = room.replace("document:", "")
    // Check if user owns the document or is a collaborator

    // Create a session for the user
    const liveblocksSession = liveblocks.prepareSession(userId, {
      userInfo: {
        name: userName,
        email: userEmail,
        color: getUserColor(userId),
        avatar: user.image || undefined,
      },
    })

    // Give the user access to the room
    liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS)

    // Authorize the session and return the token
    const { status, body: authBody } = await liveblocksSession.authorize()

    return new NextResponse(authBody, { status })
  } catch (error) {
    console.error("Liveblocks auth error:", error)
    return NextResponse.json(
      { error: "Failed to authorize" },
      { status: 500 }
    )
  }
}
