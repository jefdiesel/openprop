"use client"

import { Mail, FileText, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface EmailPreviewProps {
  subject: string
  message: string
  recipientName: string
  senderName: string
  documentTitle: string
  documentLink?: string
}

export function EmailPreview({
  subject,
  message,
  recipientName,
  senderName,
  documentTitle,
  documentLink = "#",
}: EmailPreviewProps) {
  const displayRecipientName = recipientName || "Recipient"
  const displaySenderName = senderName || "Sender"

  return (
    <div className="rounded-lg border bg-muted/30">
      {/* Email Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Email Preview</span>
      </div>

      {/* Email Content */}
      <div className="p-4 space-y-4">
        {/* Subject Line */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Subject
          </p>
          <p className="font-medium">
            {subject || `${displaySenderName} shared "${documentTitle}" with you`}
          </p>
        </div>

        <Separator />

        {/* Email Body */}
        <div className="bg-background rounded-md p-4 space-y-4">
          <p className="text-sm">Hi {displayRecipientName},</p>

          {message ? (
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {displaySenderName} has shared a document with you for review.
            </p>
          )}

          {/* Document Card */}
          <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{documentTitle}</p>
              <p className="text-xs text-muted-foreground">
                Click to view and sign
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-sm">
            Best regards,
            <br />
            {displaySenderName}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This email will be sent via OpenProposal
          </p>
        </div>
      </div>
    </div>
  )
}
