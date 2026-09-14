ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inactive_at TIMESTAMP WITH TIME ZONE;

DROP INDEX IF EXISTS public.idx_patients_normalized_phone;

CREATE INDEX IF NOT EXISTS idx_patients_normalized_phone_lookup
  ON public.patients(normalized_phone);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_active_normalized_phone
  ON public.patients(normalized_phone)
  WHERE is_active = true;
