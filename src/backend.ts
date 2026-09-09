import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { workspaceHtml } from './workspace';
import {
  insertAppointment,
  updateAppointmentWhatsApp,
  getAppointmentByIdempotencyKey,
  insertFeedback,
  updateFeedbackWhatsApp,
  getFeedbackByIdempotencyKey,
} from './supabase';
import {
  sendAppointmentConfirmation,
  sendFeedbackAcknowledgment,
} from './whatsapp';

type ValidationError = { error: string };
type ValidationSuccess<T> = { data: T };
type ValidationResult<T> = ValidationError | ValidationSuccess<T>;

interface BookingData {
  name: string;
  age: number;
  phone: string;
  location: string;
  type: string;
  date: string;
  time: string;
  consent: boolean;
}

interface FeedbackData {
  rating: number;
  message: string;
  consent: boolean;
}

interface Session {
  csrf: string;
  expires: number;
}

interface RateLimitEntry {
  count: number;
  expires: number;
}

interface RequestEntry {
  fingerprint: string;
  promise: Promise<{ status: number; body: Record<string, unknown> }>;
  expires: number;
}

interface ApiConfig {
  trustProxy?: boolean;
  enabled?: boolean;
  webhook?: string;
  webhookToken?: string;
  key?: string;
  siteUrl?: string;
  indexing?: boolean;
  fetch?: typeof globalThis.fetch;
}

const times = [
  '7:00 AM–10:00 AM',
  '10:00 AM–1:00 PM',
  '1:00 PM–4:00 PM',
  '4:00 PM–7:30 PM',
];

const digest = (value: string): Buffer => {
  return createHash('sha256').update(value).digest();
};

const clean = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const today = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
};

const xml = (value: string): string => {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  return value.replace(/[&<>"']/g, (c) => escapeMap[c] || c);
};

export function validateBooking(
  input: Record<string, unknown>,
): ValidationResult<BookingData> {
  const data: BookingData = {
    name: clean(input.name),
    age: Number(input.age),
    phone: clean(input.phone),
    location: clean(input.location),
    type: input.type as string,
    date: input.date as string,
    time: input.time as string,
    consent: input.consent as boolean,
  };

  if (data.name.length < 2 || data.name.length > 100) {
    return { error: 'Please enter your full name (2–100 characters).' };
  }

  if (!Number.isInteger(data.age) || data.age < 1 || data.age > 120) {
    return { error: 'Please enter an age between 1 and 120.' };
  }

  const digits = data.phone.replace(/\D/g, '');
  if (
    !/^\+?[\d\s()-]{8,20}$/.test(data.phone) ||
    digits.length < 8 ||
    digits.length > 15
  ) {
    return { error: 'Please enter a valid contact number.' };
  }

  if (data.location.length < 2 || data.location.length > 120) {
    return { error: 'Please enter your locality or city.' };
  }

  if (!['home', 'online'].includes(data.type)) {
    return { error: 'Please choose a home visit or online consultation.' };
  }

  if (typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    return { error: 'Please choose a valid date.' };
  }

  const parsed = new Date(data.date + 'T12:00:00Z');
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== data.date ||
    data.date < today() ||
    data.date > String(Number(today().slice(0, 4)) + 1) + today().slice(4)
  ) {
    return { error: 'Please choose a date within the next year.' };
  }

  if (parsed.getUTCDay() === 0) {
    return {
      error: 'Please choose Monday to Saturday. We are closed on Sundays.',
    };
  }

  if (!times.includes(data.time)) {
    return { error: 'Please choose an available time window.' };
  }

  if (data.consent !== true) {
    return {
      error: 'Please agree to the privacy policy and terms before continuing.',
    };
  }

  return { data };
}

function validateFeedback(
  input: Record<string, unknown>,
): ValidationResult<FeedbackData> {
  const rating = Number(input.rating);
  const message = clean(input.message);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Please choose a rating.' };
  }

  if (message.length < 5 || message.length > 2000) {
    return {
      error: 'Please enter feedback between 5 and 2,000 characters.',
    };
  }

  if (input.consent !== true) {
    return { error: 'Please consent to sharing this feedback.' };
  }

  return { data: { rating, message, consent: true } };
}

async function readJson(req: Request): Promise<Record<string, unknown>> {
  if (!req.headers.get('content-type')?.startsWith('application/json')) {
    throw {
      status: 415,
      message: 'Please send a JSON request.',
    };
  }

  let bytes = 0;
  const chunks: Uint8Array[] = [];

  const body = req.body as ReadableStream<Uint8Array> | null;
  if (body) {
    const reader = body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 16384) {
          throw {
            status: 413,
            message: 'This request is too large.',
          };
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  try {
    const combined = Buffer.concat(chunks as Buffer[]);
    const value = JSON.parse(combined.toString());
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw Error();
    }
    return value;
  } catch {
    throw {
      status: 400,
      message: 'Please check the request and try again.',
    };
  }
}

export function createApi(
  options: ApiConfig = {},
): (req: Request) => Promise<Response> {
  const cfg: Required<ApiConfig> = {
    trustProxy: process.env.TRUST_PROXY === 'true',
    enabled: process.env.BOOKING_ENABLED === 'true',
    webhook: process.env.NOTIFICATION_WEBHOOK_URL || '',
    webhookToken: process.env.NOTIFICATION_WEBHOOK_TOKEN || '',
    key: process.env.PRACTITIONER_KEY || '',
    siteUrl: process.env.SITE_URL || '',
    indexing: process.env.PUBLIC_INDEXING === 'true',
    fetch: globalThis.fetch,
    ...options,
  };

  let siteUrl = '';
  try {
    const u = new URL(cfg.siteUrl);
    if (u.protocol === 'https:') {
      siteUrl = u.origin;
    }
  } catch {
    // Empty
  }

  const sessions = new Map<string, Session>();
  const limits = new Map<string, RateLimitEntry>();
  const requests = new Map<string, RequestEntry>();

  const sweep = (): void => {
    const now = Date.now();
    for (const [k, v] of sessions) {
      if (v.expires < now) {
        sessions.delete(k);
      }
    }
    for (const [k, v] of limits) {
      if (v.expires < now) {
        limits.delete(k);
      }
    }
    for (const [k, v] of requests) {
      if (v.expires < now) {
        requests.delete(k);
      }
    }
  };

  const limited = (ip: string, kind: string, max: number): boolean => {
    const k = ip + ':' + kind;
    let v = limits.get(k);
    if (!v) {
      v = { count: 0, expires: Date.now() + 15 * 60 * 1000 };
      limits.set(k, v);
    }
    return ++v.count > max;
  };

  const session = (req: Request): Session | undefined => {
    const id = (req.headers.get('cookie') || '')
      .split(';')
      .map((x) => x.trim())
      .find((x) => x.startsWith('eudora_session='))
      ?.slice(15);
    return sessions.get(id || '');
  };

  const cookie = (id: string, age: number): string => {
    return `eudora_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${
      siteUrl ? '; Secure' : ''
    }`;
  };

  return async function handle(req: Request): Promise<Response> {
    sweep();
    const responseHeaders = new Headers({
      'Cache-Control': 'no-store',
    });

    const json = (
      status: number,
      payload: Record<string, unknown>,
    ): Response => {
      return Response.json(payload, {
        status,
        headers: responseHeaders,
      });
    };

    try {
      const path = new URL(req.url).pathname.replace(/\/$/, '');

      if (path.startsWith('/api/')) {
        const origin = req.headers.get('origin');
        const localOrigin =
          new URL(req.url).protocol +
          '//' +
          (req.headers.get('host') || new URL(req.url).host);

        if (
          req.method !== 'GET' &&
          origin &&
          origin !== (siteUrl || localOrigin)
        ) {
          return json(403, { error: 'This request is not allowed.' });
        }

        const ip = cfg.trustProxy
          ? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            'unknown'
          : 'local';

        if (path === '/api/practitioner/login' && req.method === 'POST') {
          if (limited(ip, 'login', 10)) {
            return json(429, {
              error: 'Too many attempts. Please try again in 15 minutes.',
            });
          }

          if (cfg.key.length < 24) {
            return json(503, {
              error: 'Practitioner access has not been configured yet.',
            });
          }

          const input = await readJson(req);
          if (
            typeof input.key !== 'string' ||
            !timingSafeEqual(digest(input.key), digest(cfg.key))
          ) {
            return json(401, {
              error: 'The access key was not recognised.',
            });
          }

          const id = randomBytes(32).toString('hex');
          sessions.set(id, {
            csrf: randomBytes(24).toString('hex'),
            expires: Date.now() + 3600 * 1000,
          });
          responseHeaders.set('Set-Cookie', cookie(id, 3600));
          return json(200, { ok: true });
        }

        if (path.startsWith('/api/practitioner/')) {
          const s = session(req);
          if (!s) {
            return json(401, {
              error: 'Please sign in to the practitioner workspace.',
            });
          }

          if (path === '/api/practitioner/workspace' && req.method === 'GET') {
            return json(200, { html: workspaceHtml, csrf: s.csrf });
          }

          if (path === '/api/practitioner/logout' && req.method === 'POST') {
            if (req.headers.get('x-csrf-token') !== s.csrf) {
              return json(403, {
                error: 'Please refresh and try again.',
              });
            }
            for (const [id, value] of sessions) {
              if (value === s) {
                sessions.delete(id);
              }
            }
            responseHeaders.set('Set-Cookie', cookie('', 0));
            return json(200, { ok: true });
          }

          return json(404, { error: 'Not found.' });
        }

        if (
          (path === '/api/bookings' || path === '/api/feedback') &&
          req.method === 'POST'
        ) {
          if (limited(ip, 'submission', 20)) {
            return json(429, {
              error:
                'Too many requests. Please try again later or contact us directly.',
            });
          }

          const input = await readJson(req);
          const validated =
            path === '/api/bookings'
              ? validateBooking(input)
              : validateFeedback(input);

          if ('error' in validated) {
            return json(400, { error: validated.error });
          }

          const key = req.headers.get('idempotency-key');
          if (typeof key !== 'string' || !/^[\w-]{16,100}$/.test(key)) {
            return json(400, {
              error: 'Please refresh the page and try again.',
            });
          }

          if (path === '/api/bookings') {
            // Handle appointment booking
            const bookingData = validated.data as Record<string, unknown>;

            // Check if already processed
            const existing = await getAppointmentByIdempotencyKey(key);
            if (existing.id) {
              return json(200, {
                ok: true,
                requestId: key,
              });
            }

            if (existing.error) {
              return json(500, {
                error: 'Database error. Please try again.',
              });
            }

            // Insert into database
            const insertResult = await insertAppointment({
              patient_name: bookingData.name as string,
              patient_age: bookingData.age as number,
              patient_phone: bookingData.phone as string,
              patient_location: bookingData.location as string,
              consultation_type:
                (bookingData.type as string) === 'home' ? 'home' : 'online',
              preferred_date: bookingData.date as string,
              preferred_time: bookingData.time as string,
              privacy_consent: bookingData.consent as boolean,
              idempotency_key: key,
            });

            if (insertResult.error) {
              return json(500, {
                error: 'Failed to save appointment. Please try again.',
              });
            }

            // Send WhatsApp confirmation
            const whatsappResult = await sendAppointmentConfirmation(
              bookingData.name as string,
              bookingData.phone as string,
              bookingData.date as string,
              bookingData.time as string,
              (bookingData.type as string) === 'home' ? 'home' : 'online',
            );

            // Update appointment with WhatsApp status
            await updateAppointmentWhatsApp(insertResult.id, {
              whatsapp_sent: whatsappResult.success,
              whatsapp_sent_at: whatsappResult.success
                ? new Date().toISOString()
                : undefined,
              whatsapp_message_id: whatsappResult.messageId,
              whatsapp_error: whatsappResult.error,
            });

            return json(200, {
              ok: true,
              requestId: key,
            });
          }

          if (path === '/api/feedback') {
            // Handle feedback
            const feedbackData = validated.data as Record<string, unknown>;

            // Check if already processed
            const existing = await getFeedbackByIdempotencyKey(key);
            if (existing.id) {
              return json(200, {
                ok: true,
                requestId: key,
              });
            }

            if (existing.error) {
              return json(500, {
                error: 'Database error. Please try again.',
              });
            }

            // Insert feedback
            const insertResult = await insertFeedback({
              rating: feedbackData.rating as number,
              message: feedbackData.message as string,
              consent: feedbackData.consent as boolean,
              idempotency_key: key,
            });

            if (insertResult.error) {
              return json(500, {
                error: 'Failed to save feedback. Please try again.',
              });
            }

            return json(200, {
              ok: true,
              requestId: key,
            });
          }
        }
      }

      return json(404, { error: 'Not found.' });
    } catch (error) {
      const err = error as { status?: number; message?: string };
      return json(err.status || 500, {
        error: err.status
          ? err.message
          : 'Something went wrong. Please try again.',
      });
    }
  };
}

export const handleApi = createApi();
