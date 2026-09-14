ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inactive_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inactive_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.patient_assessments
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inactive_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_patients_is_active
  ON public.patients(is_active);

CREATE INDEX IF NOT EXISTS idx_appointments_is_active
  ON public.appointments(is_active);

CREATE INDEX IF NOT EXISTS idx_assessments_is_active
  ON public.patient_assessments(is_active);
