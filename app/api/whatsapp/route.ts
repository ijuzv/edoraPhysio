import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook token from WhatsApp
  const webhookToken = process.env.WHATSAPP_WEBHOOK_TOKEN;

  if (!webhookToken) {
    console.error('WHATSAPP_WEBHOOK_TOKEN not configured');
    return NextResponse.json(
      { error: 'Webhook token not configured' },
      { status: 500 }
    );
  }

  if (token === webhookToken) {
    // Return the challenge to verify the webhook
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log incoming webhook for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Handle incoming WhatsApp messages
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === 'messages') {
            const messages = change.value?.messages || [];

            for (const message of messages) {
              console.log('New message from:', message.from);
              console.log('Message type:', message.type);

              // Process message based on type
              if (message.type === 'text') {
                console.log('Text:', message.text?.body);
              } else if (message.type === 'interactive') {
                console.log('Interactive:', message.interactive);
              }

              // TODO: Add your message processing logic here
              // - Save to database
              // - Send auto-reply
              // - Route to appropriate handler
            }
          }
        }
      }
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
