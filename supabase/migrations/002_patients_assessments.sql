-- Patient master records
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  full_name VARCHAR(120) NOT NULL,
  age INTEGER CHECK (age >= 1 AND age <= 120),
  gender VARCHAR(30),
  date_of_birth DATE,
  phone VARCHAR(20) NOT NULL,
  normalized_phone VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  address TEXT,
  emergency_contact_name VARCHAR(120),
  emergency_contact_phone VARCHAR(20)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_normalized_phone
  ON patients(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);

-- Practitioner-filled intake, assessment and PAR-Q records.
CREATE TABLE IF NOT EXISTS patient_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  consultation_type VARCHAR(30),
  preferred_day_time TEXT,
  referral_source VARCHAR(80),

  main_problem TEXT NOT NULL,
  duration_of_complaint TEXT NOT NULL,
  symptom_region TEXT NOT NULL,
  symptom_side VARCHAR(30),
  movement_range VARCHAR(40),
  pain_presentation VARCHAR(80),
  complaint_onset VARCHAR(40),
  pain_severity INTEGER CHECK (pain_severity >= 0 AND pain_severity <= 10),
  aggravating_activities TEXT NOT NULL,
  relieving_factors TEXT NOT NULL,

  medical_conditions TEXT[] DEFAULT '{}',
  other_medical_condition TEXT,
  surgery_status VARCHAR(80),
  surgery_details TEXT,
  current_medications TEXT,
  investigations TEXT[] DEFAULT '{}',

  parq_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  parq_details TEXT,

  consent_confirmed BOOLEAN NOT NULL DEFAULT false,
  electronic_signature VARCHAR(120) NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_assessments_patient_id
  ON patient_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_appointment_id
  ON patient_assessments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at
  ON patient_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_form_data
  ON patient_assessments USING GIN(form_data);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assessments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patients'
      AND policyname = 'Service role access only'
  ) THEN
    CREATE POLICY "Service role access only" ON patients
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patient_assessments'
      AND policyname = 'Service role access only'
  ) THEN
    CREATE POLICY "Service role access only" ON patient_assessments
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
