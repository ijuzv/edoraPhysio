interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: {
      code: string;
    };
    parameters?: {
      body: {
        parameters: Array<{ type: 'text'; text: string }>;
      };
    };
  };
  text?: {
    body: string;
  };
}

interface WhatsAppResponse {
  messages?: Array<{ id: string }>;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

const WHATSAPP_API_URL =
  'https://graph.instagram.com/v18.0/YOUR_PHONE_NUMBER_ID/messages';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID =
  process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

function validatePhoneNumber(phone: string): boolean {
  // WhatsApp requires E.164 format: +[country code][number]
  return /^\+?[\d\s()-]{8,20}$/.test(phone);
}

function normalizePhoneNumber(phone: string): string {
  // Convert to E.164 format for WhatsApp
  let normalized = phone.replace(/\D/g, '');

  // If no country code, assume India (+91)
  if (normalized.length === 10) {
    normalized = '91' + normalized;
  }

  return '+' + normalized;
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

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return {
      success: false,
      error: 'WhatsApp API not configured',
    };
  }

  const phone = normalizePhoneNumber(patientPhone);
  const typeLabel =
    consultationType === 'online' ? 'Online Consultation' : 'Home Visit';

  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: 'appointment_confirmation',
      language: {
        code: 'en',
      },
      parameters: {
        body: {
          parameters: [
            { type: 'text', text: patientName },
            { type: 'text', text: date },
            { type: 'text', text: time },
            { type: 'text', text: typeLabel },
          ],
        },
      },
    },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL.replace(
        'YOUR_PHONE_NUMBER_ID',
        WHATSAPP_PHONE_NUMBER_ID,
      )}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(message),
      },
    );

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Failed to send WhatsApp message',
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message,
    };
  }
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

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return {
      success: false,
      error: 'WhatsApp API not configured',
    };
  }

  const phone = normalizePhoneNumber(patientPhone);

  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: 'feedback_acknowledgment',
      language: {
        code: 'en',
      },
      parameters: {
        body: {
          parameters: [{ type: 'text', text: patientName }],
        },
      },
    },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL.replace(
        'YOUR_PHONE_NUMBER_ID',
        WHATSAPP_PHONE_NUMBER_ID,
      )}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(message),
      },
    );

    const data = (await response.json()) as WhatsAppResponse;

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Failed to send WhatsApp message',
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message,
    };
  }
}

export function formatPhoneNumberForDisplay(phone: string): string {
  // Format phone for display: +91 74181 58876
  const normalized = normalizePhoneNumber(phone);
  return normalized.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
}
