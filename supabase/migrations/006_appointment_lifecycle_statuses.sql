-- Expand appointment lifecycle statuses used by the practitioner workspace.
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Keep historical completed appointments under the closest closed outcome.
UPDATE public.appointments
SET status = 'DISCHARGED'
WHERE status = 'COMPLETED';

ALTER TABLE public.appointments
  ALTER COLUMN status TYPE VARCHAR(32);

ALTER TABLE public.appointments
  ALTER COLUMN status SET DEFAULT 'PENDING';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointments_status_check'
      AND conrelid = 'public.appointments'::regclass
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_status_check
      CHECK (
        status IN (
          'PENDING',
          'CONFIRMED',
          'CURRENT',
          'DISCONTINUED',
          'DISCHARGED',
          'FOLLOWUP_NEEDED',
          'CANCELLED',
          'NO_SHOW'
        )
      );
  END IF;
END $$;
