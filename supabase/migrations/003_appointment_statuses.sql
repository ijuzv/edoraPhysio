ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

UPDATE public.appointments
SET status = CASE lower(status)
  WHEN 'pending' THEN 'PENDING'
  WHEN 'fixed' THEN 'CONFIRMED'
  WHEN 'confirmed' THEN 'CONFIRMED'
  WHEN 'finished' THEN 'COMPLETED'
  WHEN 'completed' THEN 'COMPLETED'
  WHEN 'cancelled' THEN 'CANCELLED'
  WHEN 'no_show' THEN 'NO_SHOW'
  ELSE 'PENDING'
END;

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
          'COMPLETED',
          'CANCELLED',
          'NO_SHOW'
        )
      );
  END IF;
END $$;
