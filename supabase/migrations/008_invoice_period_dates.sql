ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS from_date DATE,
  ADD COLUMN IF NOT EXISTS to_date DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_from_to_dates'
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_from_to_dates
      CHECK (from_date IS NULL OR to_date IS NULL OR to_date >= from_date);
  END IF;
END $$;
