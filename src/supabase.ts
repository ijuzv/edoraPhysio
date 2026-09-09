import { createClient } from '@supabase/supabase-js';

interface AppointmentInsert {
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

interface FeedbackInsert {
  rating: number;
  message: string;
  consent: boolean;
  idempotency_key: string;
}

interface FeedbackUpdate {
  whatsapp_sent: boolean;
  whatsapp_message_id?: string;
  whatsapp_error?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function insertAppointment(
  data: AppointmentInsert,
): Promise<{ id: string; error?: string }> {
  try {
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

export async function getAppointmentByIdempotencyKey(
  key: string,
): Promise<{ id: string | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('idempotency_key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected
      return { id: null, error: error.message };
    }

    return { id: data?.id || null };
  } catch (error) {
    const err = error as Error;
    return { id: null, error: err.message };
  }
}

export async function insertFeedback(
  data: FeedbackInsert,
): Promise<{ id: string; error?: string }> {
  try {
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

export async function updateFeedbackWhatsApp(
  feedbackId: string,
  update: FeedbackUpdate,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('feedback')
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function getFeedbackByIdempotencyKey(
  key: string,
): Promise<{ id: string | null; error?: string }> {
  try {
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

export default supabase;
