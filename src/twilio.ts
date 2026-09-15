interface TwilioMessageResponse {
  sid?: string;
  message?: string;
  code?: number;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || '';

function validatePhoneNumber(phone: string): boolean {
  return /^\+?[\d\s()-]{8,20}$/.test(phone);
}

function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\D/g, '');

  if (normalized.length === 10) {
    normalized = '91' + normalized;
  }

  return '+' + normalized;
}

function whatsappAddress(phone: string): string {
  const normalized = phone.trim();
  if (normalized.startsWith('whatsapp:')) {
    return normalized;
  }
  return `whatsapp:${normalizePhoneNumber(normalized)}`;
}

function twilioConfigured(): boolean {
  return Boolean(
    TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM,
  );
}

async function sendTwilioWhatsApp(
  to: string,
  body: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioConfigured()) {
    return {
      success: false,
      error: 'Twilio WhatsApp is not configured',
    };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
    TWILIO_ACCOUNT_SID,
  )}/Messages.json`;
  const payload = new URLSearchParams({
    From: whatsappAddress(TWILIO_WHATSAPP_FROM),
    To: whatsappAddress(to),
    Body: body,
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    const data = (await response.json()) as TwilioMessageResponse;

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send Twilio WhatsApp message',
      };
    }

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function sendAppointmentConfirmation(
  patientName: string,
  patientPhone: string,
  date: string,
  time: string,
  consultationType: 'home' | 'online',
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!validatePhoneNumber(patientPhone)) {
    return {
      success: false,
      error: 'Invalid phone number format',
    };
  }

  const typeLabel =
    consultationType === 'online' ? 'Online consultation' : 'Home visit';
  const body = [
    `Hello ${patientName}, Eudora Movement House has received your consultation request.`,
    `Preferred date: ${date}`,
    `Preferred time: ${time}`,
    `Consultation type: ${typeLabel}`,
    'Your appointment is not confirmed yet. We will contact you personally to confirm availability.',
  ].join('\n');

  return sendTwilioWhatsApp(patientPhone, body);
}

export async function sendFeedbackAcknowledgment(
  patientName: string,
  patientPhone: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!validatePhoneNumber(patientPhone)) {
    return {
      success: false,
      error: 'Invalid phone number format',
    };
  }

  return sendTwilioWhatsApp(
    patientPhone,
    `Hello ${patientName}, thank you for sharing your feedback with Eudora Movement House.`,
  );
}

export function formatPhoneNumberForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  return normalized.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
}
