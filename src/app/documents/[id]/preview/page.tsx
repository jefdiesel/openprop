import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { PreviewContent } from "./preview-content"
import type { Block } from "@/hooks/use-builder"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DocumentPreviewPage({ params }: PageProps) {
  const resolvedParams = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch the document
  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, resolvedParams.id),
        eq(documents.userId, session.user.id)
      )
    )
    .limit(1)

  if (!document) {
    notFound()
  }

  const blocks = (document.content as Block[]) || []

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Document Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <p className="text-sm text-muted-foreground">Preview Mode</p>
        </div>

        {/* Document Paper */}
        <div className="min-h-[800px] rounded-lg border bg-background p-8 shadow-sm">
          {blocks.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              This document is empty
            </div>
          ) : (
            <PreviewContent blocks={blocks} />
          )}
        </div>
      </div>
    </div>
  )
}
