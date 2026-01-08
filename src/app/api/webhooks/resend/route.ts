import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Forward inbound emails to your personal email
const FORWARD_TO = process.env.EMAIL_FORWARD_TO || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    // Verify webhook signature
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    // Webhook verification (skip for now, can add svix library later)
    if (!svixId || !svixTimestamp || !svixSignature) {
      // Allow unverified webhooks in development
      console.warn('Missing webhook signature headers');
    }

    if (event.type === 'email.received') {
      const data = event.data;
      const emailId = data.email_id;
      const from = data.from || '';
      const to = data.to || [];
      const subject = data.subject || '(no subject)';

      // Webhook only contains metadata - fetch actual content via Receiving API
      let html = '';
      let text = '';

      if (emailId) {
        try {
          const { data: emailContent } = await resend.emails.receiving.get(emailId);
          html = emailContent?.html || '';
          text = emailContent?.text || '';
        } catch (fetchError) {
          console.error('Failed to fetch email content:', fetchError);
        }
      }

      // Forward to your email
      if (FORWARD_TO) {
        const bodyHtml = html || (text ? text.replace(/\n/g, '<br/>') : 'No content available');
        const bodyText = text || 'No content available';

        await resend.emails.send({
          from: 'OpenProposal <noreply@sendprop.com>',
          replyTo: from,
          to: FORWARD_TO,
          subject: subject || '(no subject)',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 16px; font-size: 13px; color: #666;">
                <span style="color: #999;">From:</span> ${from}<br/>
                <span style="color: #999;">To:</span> ${Array.isArray(to) ? to.join(', ') : to}
              </div>
              <div style="color: #1a1a1a; line-height: 1.6;">
                ${bodyHtml}
              </div>
            </div>
          `,
          text: `From: ${from}\nTo: ${Array.isArray(to) ? to.join(', ') : to}\n\n${bodyText}`,
        });
      }

      return NextResponse.json({ received: true, forwarded: !!FORWARD_TO });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
