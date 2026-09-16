import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { workspaceHtml } from './workspace';
import {
  createAssessment,
  createPatient,
  deleteAssessment,
  deletePatient,
  getAssessment,
  getPatient,
  insertAppointment,
  updateAppointmentDetails,
  updateAppointmentStatus,
  updateAppointmentWhatsApp,
  getAppointmentByIdempotencyKey,
  insertFeedback,
  getFeedbackByIdempotencyKey,
  listAppointments,
  listAssessments,
  listPatients,
  updateAssessment,
  updatePatient,
  normalizePhone,
} from './supabase';
import { isAppointmentStatus } from './appointment-status';
import { sendAppointmentConfirmation } from './twilio';

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

const logBooking = (
  step: string,
  details: Record<string, unknown> = {},
): void => {
  console.error('[booking]', {
    step,
    ...details,
  });
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

const optional = (value: unknown): string | null => {
  const text = clean(value);
  return text || null;
};

const stringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((x) => clean(x)).filter(Boolean).slice(0, 40);
};

function validateAssessment(input: Record<string, unknown>): ValidationResult<any> {
  const patient = (input.patient || {}) as Record<string, unknown>;
  const parq = (input.parq_answers || {}) as Record<string, string>;
  const patientId = clean(input.patient_id);

  const fullName = clean(patient.full_name);
  const phone = clean(patient.phone);
  const age = patient.age === '' || patient.age == null ? null : Number(patient.age);
  const gender = clean(patient.gender);
  const dateOfBirth = clean(patient.date_of_birth);
  const address = clean(patient.address);
  const emergencyName = clean(patient.emergency_contact_name);
  const emergencyPhone = clean(patient.emergency_contact_phone);
  const painSeverity =
    input.pain_severity === '' || input.pain_severity == null
      ? null
      : Number(input.pain_severity);

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      patientId,
    )
  ) {
    return { error: 'Please select the patient this PAR-Q belongs to.' };
  }

  if (fullName.length < 2 || fullName.length > 120) {
    return { error: 'Please enter the patient full name.' };
  }

  if (age === null || !Number.isInteger(age) || age < 1 || age > 120) {
    return { error: 'Please enter a valid patient age.' };
  }

  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d\s()-]{8,20}$/.test(phone) || digits.length < 8) {
    return { error: 'Please enter a valid patient mobile number.' };
  }
  const emergencyDigits = emergencyPhone.replace(/\D/g, '');
  if (!gender) {
    return { error: 'Please select patient gender.' };
  }
  if (!dateOfBirth) {
    return { error: 'Please enter patient date of birth.' };
  }
  if (address.length < 5) {
    return { error: 'Please enter the full residential address.' };
  }
  if (emergencyName.length < 2) {
    return { error: 'Please enter emergency contact full name.' };
  }
  if (emergencyDigits.length < 8) {
    return { error: 'Please enter a valid emergency contact phone number.' };
  }

  for (const [field, label] of [
    ['consultation_type', 'consultation type'],
    ['preferred_day_time', 'preferred day and time'],
    ['main_problem', 'main problem'],
    ['duration_of_complaint', 'duration of complaint'],
    ['symptom_region', 'region/location of symptoms'],
    ['symptom_side', 'side'],
    ['movement_range', 'range'],
    ['pain_presentation', 'pain presentation'],
    ['complaint_onset', 'onset'],
    ['aggravating_activities', 'activities that aggravate symptoms'],
    ['relieving_factors', 'factors that relieve symptoms'],
    ['surgery_status', 'surgery/procedure history'],
    ['current_medications', 'current medications'],
    ['electronic_signature', 'electronic signature'],
  ]) {
    const value = clean(input[field]);
    if (value.length < 1 || value.length > 5000) {
      return { error: `Please enter ${label}.` };
    }
  }

  if (
    painSeverity === null ||
    !Number.isInteger(painSeverity) ||
    painSeverity < 0 ||
    painSeverity > 10
  ) {
    return { error: 'Pain severity must be between 0 and 10.' };
  }
  const medicalConditions = stringList(input.medical_conditions);
  const investigations = stringList(input.investigations);
  if (medicalConditions.length === 0) {
    return { error: 'Please select at least one medical condition option.' };
  }
  if (
    medicalConditions.includes('Any other medical condition') &&
    !clean(input.other_medical_condition)
  ) {
    return { error: 'Please specify the other medical condition.' };
  }
  if (investigations.length === 0) {
    return { error: 'Please select at least one investigation option.' };
  }
  if (
    clean(input.surgery_status) !== 'No' &&
    clean(input.surgery_details).length < 1
  ) {
    return { error: 'Please enter surgery/procedure details.' };
  }

  if (input.consent_confirmed !== true) {
    return { error: 'Please confirm patient declaration and consent.' };
  }

  const requiredParq = [
    'heart_condition',
    'chest_pain_activity',
    'chest_pain_rest',
    'dizziness',
    'bone_joint_problem',
    'blood_pressure_meds',
    'other_reason',
  ];
  for (const key of requiredParq) {
    if (!['yes', 'no'].includes(clean(parq[key]).toLowerCase())) {
      return { error: 'Please answer every PAR-Q question.' };
    }
  }

  const patientData = {
    full_name: fullName,
    age,
    gender,
    date_of_birth: dateOfBirth,
    phone,
    email: optional(patient.email),
    address,
    emergency_contact_name: emergencyName,
    emergency_contact_phone: emergencyPhone,
  };

  return {
    data: {
      patient_id: patientId,
      patient: patientData,
      appointment_id: optional(input.appointment_id),
      consultation_type: optional(input.consultation_type),
      preferred_day_time: optional(input.preferred_day_time),
      referral_source: optional(input.referral_source),
      main_problem: clean(input.main_problem),
      duration_of_complaint: clean(input.duration_of_complaint),
      symptom_region: clean(input.symptom_region),
      symptom_side: optional(input.symptom_side),
      movement_range: optional(input.movement_range),
      pain_presentation: optional(input.pain_presentation),
      complaint_onset: optional(input.complaint_onset),
      pain_severity: painSeverity,
      aggravating_activities: clean(input.aggravating_activities),
      relieving_factors: clean(input.relieving_factors),
      medical_conditions: medicalConditions,
      other_medical_condition: optional(input.other_medical_condition),
      surgery_status: optional(input.surgery_status),
      surgery_details: optional(input.surgery_details),
      current_medications: optional(input.current_medications),
      investigations,
      parq_answers: requiredParq.reduce<Record<string, string>>((acc, key) => {
        acc[key] = clean(parq[key]).toLowerCase();
        return acc;
      }, {}),
      parq_details: optional(input.parq_details),
      consent_confirmed: true,
      electronic_signature: clean(input.electronic_signature),
    },
  };
}

function validatePatient(input: Record<string, unknown>): ValidationResult<any> {
  const fullName = clean(input.full_name);
  const phone = clean(input.phone);
  const age = input.age === '' || input.age == null ? null : Number(input.age);

  if (fullName.length < 2 || fullName.length > 120) {
    return { error: 'Please enter the patient full name.' };
  }
  if (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) {
    return { error: 'Please enter a valid patient age.' };
  }

  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d\s()-]{8,20}$/.test(phone) || digits.length < 8) {
    return { error: 'Please enter a valid patient mobile number.' };
  }

  return {
    data: {
      full_name: fullName,
      age,
      gender: optional(input.gender),
      date_of_birth: optional(input.date_of_birth),
      phone,
      email: optional(input.email),
      address: optional(input.address),
      emergency_contact_name: optional(input.emergency_contact_name),
      emergency_contact_phone: optional(input.emergency_contact_phone),
    },
  };
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

async function verifySelectedPatient(
  patientId: string,
  patientInput: { phone: string },
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const selected = await getPatient(patientId);
  if (selected.error || !selected.data) {
    return {
      ok: false,
      status: 404,
      error: 'Selected patient was not found. Please choose a patient again.',
    };
  }
  if ((selected.data as any).is_active === false) {
    return {
      ok: false,
      status: 409,
      error: 'Selected patient is inactive. Please choose an active patient.',
    };
  }

  const selectedPhone = normalizePhone(String((selected.data as any).phone || ''));
  const formPhone = normalizePhone(patientInput.phone);
  if (selectedPhone !== formPhone) {
    return {
      ok: false,
      status: 409,
      error:
        'The selected patient and mobile number do not match. Please choose the correct patient or update the patient details first.',
    };
  }

  return { ok: true };
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

        const allowedOrigins = new Set([localOrigin]);
        if (siteUrl) {
          allowedOrigins.add(siteUrl);
        }

        if (req.method !== 'GET' && origin && !allowedOrigins.has(origin)) {
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

          const url = new URL(req.url);
          const listOptions = {
            page: Number(url.searchParams.get('page') || 1),
            pageSize: Number(url.searchParams.get('pageSize') || 10),
            search: clean(url.searchParams.get('search')),
            type: clean(url.searchParams.get('type')),
            status: clean(url.searchParams.get('status')),
            from: clean(url.searchParams.get('from')),
            to: clean(url.searchParams.get('to')),
            active: clean(url.searchParams.get('active')),
          };

          if (path === '/api/practitioner/patients' && req.method === 'GET') {
            const result = await listPatients(listOptions);
            if (result.error) {
              return json(500, { error: result.error });
            }
            return json(200, result as unknown as Record<string, unknown>);
          }

          if (path === '/api/practitioner/patients' && req.method === 'POST') {
            if (req.headers.get('x-csrf-token') !== s.csrf) {
              return json(403, { error: 'Please refresh and try again.' });
            }

            const input = await readJson(req);
            const validated = validatePatient(input);
            if ('error' in validated) {
              return json(400, { error: validated.error });
            }

            const result = await createPatient(validated.data);
            if (result.error) {
              return json(
                result.error.includes('already exists') ? 409 : 500,
                { error: result.error },
              );
            }
            return json(200, { ok: true, id: result.id });
          }

          if (path.startsWith('/api/practitioner/patients/')) {
            const id = path.split('/').pop() || '';
            if (
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                id,
              )
            ) {
              return json(404, { error: 'Not found.' });
            }

            if (req.method === 'PUT') {
              if (req.headers.get('x-csrf-token') !== s.csrf) {
                return json(403, { error: 'Please refresh and try again.' });
              }

              const input = await readJson(req);
              const validated = validatePatient(input);
              if ('error' in validated) {
                return json(400, { error: validated.error });
              }

              const result = await updatePatient(id, validated.data);
              if (result.error) {
                return json(500, { error: result.error });
              }
              return json(200, { ok: true, data: result.data });
            }

            if (req.method === 'DELETE') {
              if (req.headers.get('x-csrf-token') !== s.csrf) {
                return json(403, { error: 'Please refresh and try again.' });
              }

              const result = await deletePatient(id);
              if (result.error) {
                return json(500, { error: result.error });
              }
              return json(200, { ok: true });
            }
          }

          if (
            path === '/api/practitioner/appointments' &&
            req.method === 'GET'
          ) {
            const result = await listAppointments(listOptions);
            if (result.error) {
              return json(500, { error: result.error });
            }
            return json(200, result as unknown as Record<string, unknown>);
          }

          if (path.startsWith('/api/practitioner/appointments/')) {
            const id = path.split('/').pop() || '';
            if (
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                id,
              )
            ) {
              return json(404, { error: 'Not found.' });
            }
            if (req.method === 'PUT') {
              if (req.headers.get('x-csrf-token') !== s.csrf) {
                return json(403, { error: 'Please refresh and try again.' });
              }
              const input = await readJson(req);
              const status = clean(input.status);
              const type = clean(input.type);
              const date = clean(input.date);
              const time = clean(input.time);

              if (status) {
                if (!isAppointmentStatus(status)) {
                  return json(400, { error: 'Please choose a valid status.' });
                }
                const result = await updateAppointmentStatus(id, status);
                if (result.error) {
                  return json(500, { error: result.error });
                }
                return json(200, { ok: true });
              }

              if (!['home', 'online'].includes(type)) {
                return json(400, { error: 'Please choose appointment type.' });
              }
              if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return json(400, { error: 'Please enter appointment date.' });
              }
              if (time.length < 3 || time.length > 30) {
                return json(400, { error: 'Please enter preferred time.' });
              }
              const result = await updateAppointmentDetails(id, {
                consultation_type: type as 'home' | 'online',
                preferred_date: date,
                preferred_time: time,
              });
              if (result.error) {
                return json(500, { error: result.error });
              }
              return json(200, { ok: true });
            }
          }

          if (
            path === '/api/practitioner/assessments' &&
            req.method === 'GET'
          ) {
            const result = await listAssessments(listOptions);
            if (result.error) {
              return json(500, { error: result.error });
            }
            return json(200, result as unknown as Record<string, unknown>);
          }

          if (
            path === '/api/practitioner/assessments' &&
            req.method === 'POST'
          ) {
            if (req.headers.get('x-csrf-token') !== s.csrf) {
              return json(403, { error: 'Please refresh and try again.' });
            }

            const input = await readJson(req);
            const validated = validateAssessment(input);
            if ('error' in validated) {
              return json(400, { error: validated.error });
            }

            const selectedPatient = await verifySelectedPatient(
              validated.data.patient_id,
              validated.data.patient,
            );
            if (!selectedPatient.ok) {
              return json(selectedPatient.status, {
                error: selectedPatient.error,
              });
            }

            const formData = {
              ...input,
              patient_id: validated.data.patient_id,
              patient: validated.data.patient,
            };
            const { patient: _patient, ...assessmentData } = validated.data;
            const result = await createAssessment({
              ...assessmentData,
              form_data: formData,
            });
            if (result.error) {
              return json(500, { error: result.error });
            }
            return json(200, { ok: true, data: result.data });
          }

          if (path.startsWith('/api/practitioner/assessments/')) {
            const id = path.split('/').pop() || '';
            if (
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                id,
              )
            ) {
              return json(404, { error: 'Not found.' });
            }

            if (req.method === 'GET') {
              const result = await getAssessment(id);
              if (result.error) {
                return json(404, { error: 'Assessment not found.' });
              }
              return json(200, { data: result.data });
            }

            if (req.method === 'PUT') {
              if (req.headers.get('x-csrf-token') !== s.csrf) {
                return json(403, { error: 'Please refresh and try again.' });
              }

              const input = await readJson(req);
              const validated = validateAssessment(input);
              if ('error' in validated) {
                return json(400, { error: validated.error });
              }

              const selectedPatient = await verifySelectedPatient(
                validated.data.patient_id,
                validated.data.patient,
              );
              if (!selectedPatient.ok) {
                return json(selectedPatient.status, {
                  error: selectedPatient.error,
                });
              }

              const { patient: _patient, ...assessmentData } = validated.data;
              const result = await updateAssessment(id, {
                ...assessmentData,
                form_data: {
                  ...input,
                  patient_id: validated.data.patient_id,
                  patient: validated.data.patient,
                },
              });
              if (result.error) {
                return json(500, { error: result.error });
              }
              return json(200, { ok: true, data: result.data });
            }

            if (req.method === 'DELETE') {
              if (req.headers.get('x-csrf-token') !== s.csrf) {
                return json(403, { error: 'Please refresh and try again.' });
              }

              const result = await deleteAssessment(id);
              if (result.error) {
                return json(500, { error: result.error });
              }
              return json(200, { ok: true });
            }
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
          const key = req.headers.get('idempotency-key');
          if (typeof key !== 'string' || !/^[\w-]{16,100}$/.test(key)) {
            return json(400, {
              error: 'Please refresh the page and try again.',
            });
          }

          if (path === '/api/bookings') {
            // Handle appointment booking
            const validated = validateBooking(input);
            if ('error' in validated) {
              logBooking('validation_failed', {
                reason: validated.error,
              });
              return json(400, { error: validated.error });
            }
            const bookingData = validated.data;
            logBooking('validation_ok', {
              requestId: key,
              type: bookingData.type,
              date: bookingData.date,
              time: bookingData.time,
            });

            // Check if already processed
            const existing = await getAppointmentByIdempotencyKey(key);
            if (existing.id) {
              logBooking('duplicate_request', {
                requestId: key,
                appointmentId: existing.id,
              });
              return json(200, {
                ok: true,
                requestId: key,
              });
            }

            if (existing.error) {
              logBooking('idempotency_lookup_failed', {
                requestId: key,
                error: existing.error,
              });
              return json(500, {
                error: 'Database error. Please try again.',
              });
            }

            // Insert the request as an appointment snapshot. The practitioner
            // maps it to a patient record explicitly after reviewing details.
            const insertResult = await insertAppointment({
              patient_id: null,
              patient_name: bookingData.name,
              patient_age: bookingData.age,
              patient_phone: bookingData.phone,
              patient_location: bookingData.location,
              consultation_type:
                bookingData.type === 'home' ? 'home' : 'online',
              preferred_date: bookingData.date,
              preferred_time: bookingData.time,
              privacy_consent: bookingData.consent,
              idempotency_key: key,
            });

            if (insertResult.error) {
              logBooking('appointment_insert_failed', {
                requestId: key,
                error: insertResult.error,
              });
              return json(500, {
                error: 'Failed to save appointment. Please try again.',
              });
            }
            logBooking('appointment_inserted', {
              requestId: key,
              appointmentId: insertResult.id,
            });

            // Send Twilio WhatsApp acknowledgement
            const whatsappResult = await sendAppointmentConfirmation(
              bookingData.name,
              bookingData.phone,
              bookingData.date,
              bookingData.time,
              bookingData.type === 'home' ? 'home' : 'online',
            );
            logBooking('twilio_ack_result', {
              requestId: key,
              appointmentId: insertResult.id,
              success: whatsappResult.success,
              messageId: whatsappResult.messageId,
              error: whatsappResult.error,
            });

            // Keep the existing database columns while recording Twilio delivery.
            const notificationUpdate = await updateAppointmentWhatsApp(
              insertResult.id,
              {
                whatsapp_sent: whatsappResult.success,
                whatsapp_sent_at: whatsappResult.success
                  ? new Date().toISOString()
                  : undefined,
                whatsapp_message_id: whatsappResult.messageId,
                whatsapp_error: whatsappResult.error,
              },
            );
            if (notificationUpdate.error) {
              logBooking('notification_status_update_failed', {
                requestId: key,
                appointmentId: insertResult.id,
                error: notificationUpdate.error,
              });
            }

            return json(200, {
              ok: true,
              requestId: key,
            });
          }

          if (path === '/api/feedback') {
            // Handle feedback
            const validated = validateFeedback(input);
            if ('error' in validated) {
              return json(400, { error: validated.error });
            }
            const feedbackData = validated.data;

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
              rating: feedbackData.rating,
              message: feedbackData.message,
              consent: feedbackData.consent,
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
