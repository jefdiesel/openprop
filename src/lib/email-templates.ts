interface EmailTemplateVariables {
  recipientName: string
  senderName: string
  documentTitle: string
  message?: string
  documentLink: string
  expiresAt?: Date
  // Payment info
  paymentEnabled?: boolean
  paymentAmount?: number
  paymentCurrency?: string
  paymentTiming?: "before_signature" | "after_signature"
}

export function generateDocumentInvitationEmail({
  recipientName,
  senderName,
  documentTitle,
  message,
  documentLink,
  expiresAt,
  paymentEnabled,
  paymentAmount,
  paymentCurrency,
  paymentTiming,
}: EmailTemplateVariables): string {
  const displayRecipientName = recipientName || "there"
  const displaySenderName = senderName || "Someone"

  const expirationNotice = expiresAt
    ? `<p style="color: #666; font-size: 12px; margin-top: 16px;">This document will expire on ${expiresAt.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}.</p>`
    : ""

  const customMessage = message
    ? `<p style="color: #333; font-size: 14px; line-height: 1.6; margin: 16px 0; white-space: pre-wrap;">${escapeHtml(message)}</p>`
    : ""

  // Format payment amount with currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  }

  const paymentNotice =
    paymentEnabled && paymentAmount
      ? `<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
                Payment Required
              </p>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #78350f;">
                ${formatCurrency(paymentAmount, paymentCurrency || "USD")}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #92400e;">
                ${paymentTiming === "before_signature" ? "Payment is required before you can sign this document." : "Payment will be collected after you sign this document."}
              </p>
            </td>
          </tr>
        </table>`
      : ""

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Shared: ${escapeHtml(documentTitle)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">OpenProposal</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                Hi ${escapeHtml(displayRecipientName)},
              </h2>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                ${escapeHtml(displaySenderName)} has shared a document with you.
              </p>

              ${customMessage}

              ${paymentNotice}

              <!-- Document Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                  <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                      ${escapeHtml(documentTitle)}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
                      Click the button below to view and sign this document
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(documentLink)}"
                       style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
                      View Document
                    </a>
                  </td>
                </tr>
              </table>

              ${expirationNotice}

              <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Best regards,<br>
                ${escapeHtml(displaySenderName)}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                This email was sent via OpenProposal.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

export function generateDocumentInvitationSubject(
  senderName: string,
  documentTitle: string
): string {
  const displaySenderName = senderName || "Someone"
  return `${displaySenderName} shared "${documentTitle}" with you`
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
}

// Signing confirmation email templates
interface SigningConfirmationVariables {
  recipientName: string
  documentTitle: string
  signedAt: Date
}

export function generateSigningConfirmationEmail({
  recipientName,
  documentTitle,
  signedAt,
}: SigningConfirmationVariables): string {
  const displayRecipientName = recipientName || "there"
  const formattedDate = signedAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Signed: ${escapeHtml(documentTitle)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">OpenProposal</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
              <!-- Success Badge -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 16px;">
                  <span style="font-size: 32px;">✓</span>
                </div>
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a1a; text-align: center;">
                Document Signed Successfully
              </h2>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Hi ${escapeHtml(displayRecipientName)}, your signature has been recorded.
              </p>

              <!-- Document Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                  <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                      ${escapeHtml(documentTitle)}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
                      Signed on ${formattedDate}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                This email serves as confirmation that you have signed the document.
                Please keep this email for your records.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                This email was sent via OpenProposal.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

export function generateSigningConfirmationSubject(documentTitle: string): string {
  return `Signed: ${documentTitle}`
}

export function generateSigningConfirmationPlainText({
  recipientName,
  documentTitle,
  signedAt,
}: SigningConfirmationVariables): string {
  const displayRecipientName = recipientName || "there"
  const formattedDate = signedAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return `
Hi ${displayRecipientName},

Your signature has been successfully recorded.

Document: ${documentTitle}
Signed on: ${formattedDate}

This email serves as confirmation that you have signed the document.
Please keep this email for your records.

---
This email was sent via OpenProposal.
`.trim()
}

export function generatePlainTextEmail({
  recipientName,
  senderName,
  documentTitle,
  message,
  documentLink,
  expiresAt,
  paymentEnabled,
  paymentAmount,
  paymentCurrency,
  paymentTiming,
}: EmailTemplateVariables): string {
  const displayRecipientName = recipientName || "there"
  const displaySenderName = senderName || "Someone"

  const expirationNotice = expiresAt
    ? `\n\nThis document will expire on ${expiresAt.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}.`
    : ""

  const customMessage = message ? `\n\n${message}` : ""

  // Format payment amount with currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  }

  const paymentNotice =
    paymentEnabled && paymentAmount
      ? `\n\n---\nPAYMENT REQUIRED: ${formatCurrency(paymentAmount, paymentCurrency || "USD")}\n${paymentTiming === "before_signature" ? "Payment is required before you can sign this document." : "Payment will be collected after you sign this document."}`
      : ""

  return `
Hi ${displayRecipientName},

${displaySenderName} has shared a document with you.${customMessage}${paymentNotice}

Document: ${documentTitle}

View and sign the document here:
${documentLink}${expirationNotice}

Best regards,
${displaySenderName}

---
This email was sent via OpenProposal.
If you didn't expect this email, you can safely ignore it.
`.trim()
}
