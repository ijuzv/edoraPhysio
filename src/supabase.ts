import { createClient } from '@supabase/supabase-js';

export interface PatientInput {
  full_name: string;
  age?: number | null;
  gender?: string | null;
  date_of_birth?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

interface AppointmentInsert {
  patient_id?: string | null;
  patient_name: string;
  patient_age: number;
  patient_phone: string;
  patient_location: string;
  consultation_type: 'home' | 'online';
  preferred_date: string;
  preferred_time: string;
  privacy_consent: boolean;
  idempotency_key: string;
}

interface AppointmentUpdate {
  whatsapp_sent: boolean;
  whatsapp_sent_at?: string;
  whatsapp_message_id?: string;
  whatsapp_error?: string;
}

type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

const finalAppointmentStatuses = new Set([
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

interface FeedbackInsert {
  rating: number;
  message: string;
  consent: boolean;
  idempotency_key: string;
}

export interface AssessmentInput {
  id?: string;
  patient_id: string;
  appointment_id?: string | null;
  consultation_type?: string | null;
  preferred_day_time?: string | null;
  referral_source?: string | null;
  main_problem: string;
  duration_of_complaint: string;
  symptom_region: string;
  symptom_side?: string | null;
  movement_range?: string | null;
  pain_presentation?: string | null;
  complaint_onset?: string | null;
  pain_severity?: number | null;
  aggravating_activities: string;
  relieving_factors: string;
  medical_conditions?: string[];
  other_medical_condition?: string | null;
  surgery_status?: string | null;
  surgery_details?: string | null;
  current_medications?: string | null;
  investigations?: string[];
  parq_answers: Record<string, string>;
  parq_details?: string | null;
  consent_confirmed: boolean;
  electronic_signature: string;
  form_data: Record<string, unknown>;
}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getSupabase = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return '+' + digits;
}

function pageRange(options: ListOptions): [number, number] {
  const page = Math.max(1, Number(options.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize || 10)));
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}

export async function upsertPatient(
  data: PatientInput,
): Promise<{ id: string; error?: string }> {
  try {
    const supabase = getSupabase();
    const normalized_phone = normalizePhone(data.phone);
    const payload = {
      ...data,
      normalized_phone,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('patients')
      .upsert(payload, { onConflict: 'normalized_phone' })
      .select('id')
      .single();

    if (error) {
      return { id: '', error: error.message };
    }

    return { id: result.id };
  } catch (error) {
    const err = error as Error;
    return { id: '', error: err.message };
  }
}

export async function createPatient(
  data: PatientInput,
): Promise<{ id: string; error?: string }> {
  try {
    const supabase = getSupabase();
    const normalized_phone = normalizePhone(data.phone);
    const { data: result, error } = await supabase
      .from('patients')
      .insert([{ ...data, normalized_phone }])
      .select('id')
      .single();

    if (error) {
      return {
        id: '',
        error:
          error.code === '23505'
            ? 'A patient with this mobile number already exists. Please use a different number or edit the existing patient.'
            : error.message,
      };
    }

    return { id: result.id };
  } catch (error) {
    const err = error as Error;
    return { id: '', error: err.message };
  }
}

export async function updatePatient(
  id: string,
  data: PatientInput,
): Promise<{ data: unknown; error?: string }> {
  try {
    const supabase = getSupabase();
    const { data: result, error } = await supabase
      .from('patients')
      .update({
        ...data,
        normalized_phone: normalizePhone(data.phone),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    return {
      data: result,
      error:
        error?.code === '23505'
          ? 'A patient with this mobile number already exists. Please use a different number.'
          : error?.message,
    };
  } catch (error) {
    const err = error as Error;
    return { data: null, error: err.message };
  }
}

export async function deletePatient(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const { count: assessmentCount, error: assessmentError } = await supabase
      .from('patient_assessments')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', id);
    if (assessmentError) {
      return { success: false, error: assessmentError.message };
    }
    const { count: appointmentCount, error: appointmentError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', id);
    if (appointmentError) {
      return { success: false, error: appointmentError.message };
    }
    if ((assessmentCount || 0) > 0 || (appointmentCount || 0) > 0) {
      return {
        success: false,
        error:
          'This patient has linked appointments or PAR-Q forms, so it cannot be deleted.',
      };
    }

    const { error } = await supabase.from('patients').delete().eq('id', id);
    return { success: !error, error: error?.message };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function insertAppointment(
  data: AppointmentInsert,
): Promise<{ id: string; error?: string }> {
  try {
    const supabase = getSupabase();
    const { data: result, error } = await supabase
      .from('appointments')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      return { id: '', error: error.message };
    }

    return { id: result.id };
  } catch (error) {
    const err = error as Error;
    return { id: '', error: err.message };
  }
}

export async function updateAppointmentWhatsApp(
  appointmentId: string,
  update: AppointmentUpdate,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('appointments')
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const { data: existing, error: lookupError } = await supabase
      .from('appointments')
      .select('status')
      .eq('id', appointmentId)
      .single();

    if (lookupError) {
      return { success: false, error: lookupError.message };
    }
    if (finalAppointmentStatuses.has(String(existing?.status || ''))) {
      return {
        success: false,
        error: 'This appointment is already final and cannot be changed.',
      };
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    return { success: !error, error: error?.message };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function getAppointmentByIdempotencyKey(
  key: string,
): Promise<{ id: string | null; error?: string }> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('idempotency_key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { id: null, error: error.message };
    }

    return { id: data?.id || null };
  } catch (error) {
    const err = error as Error;
    return { id: null, error: err.message };
  }
}

export async function listPatients(options: ListOptions = {}) {
  const supabase = getSupabase();
  const [from, to] = pageRange(options);
  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options.search) {
    const q = options.search.replace(/[%(),]/g, '').trim();
    query = query.or(
      `full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`,
    );
  }

  const { data, error, count } = await query;
  return { data: data || [], count: count || 0, error: error?.message };
}

export async function getPatient(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error: error?.message };
}

export async function listAppointments(options: ListOptions = {}) {
  const supabase = getSupabase();
  const [from, to] = pageRange(options);
  let query = supabase
    .from('appointments')
    .select('*, patients(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options.search) {
    const q = options.search.replace(/[%(),]/g, '').trim();
    query = query.or(
      `patient_name.ilike.%${q}%,patient_phone.ilike.%${q}%,patient_location.ilike.%${q}%`,
    );
  }
  if (options.type) {
    query = query.eq('consultation_type', options.type);
  }
  if (options.status) {
    query = query.eq('status', options.status);
  }
  if (options.from) {
    query = query.gte('preferred_date', options.from);
  }
  if (options.to) {
    query = query.lte('preferred_date', options.to);
  }

  const { data, error, count } = await query;
  return { data: data || [], count: count || 0, error: error?.message };
}

export async function listAssessments(options: ListOptions = {}) {
  const supabase = getSupabase();
  const [from, to] = pageRange(options);
  let query = supabase
    .from('patient_assessments')
    .select('*, patients(*), appointments(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options.type) {
    query = query.eq('consultation_type', options.type);
  }
  if (options.from) {
    query = query.gte('created_at', options.from);
  }
  if (options.to) {
    query = query.lte('created_at', options.to);
  }

  const { data, error, count } = await query;
  let rows = data || [];
  if (options.search) {
    const q = options.search.toLowerCase();
    rows = rows.filter((row: any) => {
      const patient = row.patients || {};
      return [patient.full_name, patient.phone, patient.email, row.main_problem]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q));
    });
  }
  return { data: rows, count: count || rows.length, error: error?.message };
}

export async function createAssessment(data: AssessmentInput) {
  const supabase = getSupabase();
  const { data: result, error } = await supabase
    .from('patient_assessments')
    .insert([data])
    .select('*, patients(*), appointments(*)')
    .single();
  return { data: result, error: error?.message };
}

export async function updateAssessment(id: string, data: AssessmentInput) {
  const supabase = getSupabase();
  const { data: result, error } = await supabase
    .from('patient_assessments')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, patients(*), appointments(*)')
    .single();
  return { data: result, error: error?.message };
}

export async function deleteAssessment(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('patient_assessments')
    .delete()
    .eq('id', id);
  return { success: !error, error: error?.message };
}

export async function getAssessment(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('patient_assessments')
    .select('*, patients(*), appointments(*)')
    .eq('id', id)
    .single();
  return { data, error: error?.message };
}

export async function insertFeedback(
  data: FeedbackInsert,
): Promise<{ id: string; error?: string }> {
  try {
    const supabase = getSupabase();
    const { data: result, error } = await supabase
      .from('feedback')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      return { id: '', error: error.message };
    }

    return { id: result.id };
  } catch (error) {
    const err = error as Error;
    return { id: '', error: err.message };
  }
}

export async function getFeedbackByIdempotencyKey(
  key: string,
): Promise<{ id: string | null; error?: string }> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .eq('idempotency_key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { id: null, error: error.message };
    }

    return { id: data?.id || null };
  } catch (error) {
    const err = error as Error;
    return { id: null, error: err.message };
  }
}

export default getSupabase;
