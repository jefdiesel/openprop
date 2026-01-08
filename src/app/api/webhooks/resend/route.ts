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

    if (process.env.RESEND_WEBHOOK_SECRET && svixId && svixTimestamp && svixSignature) {
      try {
        resend.webhooks.verify({
          payload: body,
          headers: {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
          },
          secret: process.env.RESEND_WEBHOOK_SECRET,
        });
      } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    if (event.type === 'email.received') {
      const { email_id, from, to, subject } = event.data;

      // Get the full email content
      const emailContent = await fetch(
        `https://api.resend.com/emails/${email_id}/content`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
        }
      ).then((res) => res.json());

      // Forward to your email
      if (FORWARD_TO) {
        await resend.emails.send({
          from: 'OpenProposal <noreply@sendprop.com>',
          to: FORWARD_TO,
          subject: `[Fwd] ${subject}`,
          html: `
            <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; margin-bottom: 16px;">
              <p><strong>From:</strong> ${from}</p>
              <p><strong>To:</strong> ${to.join(', ')}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            <hr />
            ${emailContent.html || emailContent.text || 'No content'}
          `,
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
