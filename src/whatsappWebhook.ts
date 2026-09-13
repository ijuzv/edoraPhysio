const verifyToken =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
  process.env.WHATSAPP_WEBHOOK_TOKEN ||
  '';

export function verifyWhatsAppWebhook(request: Request): Response {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (!verifyToken) {
    return Response.json(
      { error: 'Webhook verify token is not configured.' },
      { status: 503 },
    );
  }

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  }

  return Response.json({ error: 'Invalid webhook verification.' }, { status: 403 });
}

export async function receiveWhatsAppWebhook(
  request: Request,
): Promise<Response> {
  try {
    const body = await request.json();

    if (body?.object === 'whatsapp_business_account') {
      const entries = Array.isArray(body.entry) ? body.entry : [];
      let messageCount = 0;
      let statusCount = 0;

      for (const entry of entries) {
        const changes = Array.isArray(entry?.changes) ? entry.changes : [];
        for (const change of changes) {
          if (change?.field !== 'messages') {
            continue;
          }

          const value = change.value || {};
          messageCount += Array.isArray(value.messages) ? value.messages.length : 0;
          statusCount += Array.isArray(value.statuses) ? value.statuses.length : 0;
        }
      }

      console.info('WhatsApp webhook received', {
        entries: entries.length,
        messages: messageCount,
        statuses: statusCount,
      });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
}
