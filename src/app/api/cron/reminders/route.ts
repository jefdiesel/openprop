import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { documents, recipients, documentEvents, users, profiles } from '@/lib/db/schema'
import { eq, and, inArray, desc } from 'drizzle-orm'
import type { DocumentSettings } from '@/types/database'
import {
  generateReminderEmail,
  generateReminderSubject,
  generateReminderPlainText,
} from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

// Default reminder days if not specified in document settings
const DEFAULT_REMINDER_DAYS = [1, 3, 7]

/**
 * Vercel Cron handler for sending reminder emails to unsigned document recipients
 * This endpoint is triggered daily by Vercel Cron
 *
 * Protected by CRON_SECRET environment variable verification
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting reminder check...')

    // Find all documents that are "sent" or "viewed" status (not completed, expired, or declined)
    const pendingDocuments = await db.query.documents.findMany({
      where: inArray(documents.status, ['sent', 'viewed']),
      with: {
        recipients: true,
        user: true,
      },
    })

    console.log(`[Cron] Found ${pendingDocuments.length} pending documents`)

    const now = new Date()
    let remindersSent = 0
    let errors: string[] = []

    for (const document of pendingDocuments) {
      try {
        // Skip if document is expired
        if (document.expiresAt && new Date(document.expiresAt) < now) {
          continue
        }

        // Skip if document was never sent
        if (!document.sentAt) {
          continue
        }

        const docSettings = document.settings as DocumentSettings | null
        const reminderDays = docSettings?.reminderDays || DEFAULT_REMINDER_DAYS
        const sentAt = new Date(document.sentAt)
        const daysSinceSent = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24))

        // Get sender info
        const sender = document.user
        const [senderProfile] = await db.select().from(profiles).where(eq(profiles.id, document.userId))
        const senderName = sender?.name || senderProfile?.companyName || 'Someone'

        // Process each recipient who hasn't signed
        for (const recipient of document.recipients) {
          // Skip if already signed or declined
          if (recipient.status === 'signed' || recipient.status === 'declined') {
            continue
          }

          // Check if a reminder is due based on reminderDays
          const reminderDue = reminderDays.find((day) => day === daysSinceSent)
          if (reminderDue === undefined) {
            continue
          }

          // Check when last reminder was sent to this recipient
          const lastReminderEvent = await db.query.documentEvents.findFirst({
            where: and(
              eq(documentEvents.documentId, document.id),
              eq(documentEvents.recipientId, recipient.id),
              eq(documentEvents.eventType, 'reminder_sent')
            ),
            orderBy: [desc(documentEvents.createdAt)],
          })

          // If we already sent a reminder today for this day milestone, skip
          if (lastReminderEvent) {
            const lastReminderDate = new Date(lastReminderEvent.createdAt)
            const eventData = lastReminderEvent.eventData as { dayNumber?: number } | null

            // Skip if we already sent a reminder for this specific day milestone
            if (eventData?.dayNumber === daysSinceSent) {
              continue
            }

            // Also skip if we sent any reminder in the last 24 hours (prevent duplicate sends)
            const hoursSinceLastReminder = (now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60)
            if (hoursSinceLastReminder < 24) {
              continue
            }
          }

          // Send reminder email
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openproposal.io'
          const documentLink = `${baseUrl}/sign/${recipient.accessToken}`

          const subject = generateReminderSubject(document.title)
          const htmlContent = generateReminderEmail({
            recipientName: recipient.name || '',
            senderName,
            documentTitle: document.title,
            documentLink,
            daysSinceSent,
            expiresAt: document.expiresAt || undefined,
          })
          const textContent = generateReminderPlainText({
            recipientName: recipient.name || '',
            senderName,
            documentTitle: document.title,
            documentLink,
            daysSinceSent,
            expiresAt: document.expiresAt || undefined,
          })

          try {
            const emailResult = await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'SendProp <noreply@send.sendprop.com>',
              to: recipient.email,
              subject,
              html: htmlContent,
              text: textContent,
            })

            if (emailResult.error) {
              console.error(`[Cron] Email error for ${recipient.email}:`, emailResult.error)
              errors.push(`Failed to send reminder to ${recipient.email}: ${emailResult.error.message}`)
              continue
            }

            // Log reminder event
            await db.insert(documentEvents).values({
              documentId: document.id,
              recipientId: recipient.id,
              eventType: 'reminder_sent',
              eventData: {
                dayNumber: daysSinceSent,
                recipientEmail: recipient.email,
                reminderNumber: reminderDays.indexOf(daysSinceSent) + 1,
                totalReminders: reminderDays.length,
              },
            })

            remindersSent++
            console.log(`[Cron] Sent reminder to ${recipient.email} for document ${document.id} (day ${daysSinceSent})`)
          } catch (emailError) {
            console.error(`[Cron] Failed to send email to ${recipient.email}:`, emailError)
            errors.push(`Failed to send reminder to ${recipient.email}`)
          }
        }
      } catch (docError) {
        console.error(`[Cron] Error processing document ${document.id}:`, docError)
        errors.push(`Error processing document ${document.id}`)
      }
    }

    console.log(`[Cron] Reminder check complete. Sent ${remindersSent} reminders.`)

    return NextResponse.json({
      success: true,
      remindersSent,
      documentsProcessed: pendingDocuments.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[Cron] Error in reminder cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering (still requires CRON_SECRET)
export async function POST(request: NextRequest) {
  return GET(request)
}
