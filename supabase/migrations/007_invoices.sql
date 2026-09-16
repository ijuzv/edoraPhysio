CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'EMH-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0');
$$;

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  invoice_number VARCHAR(20) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE,

  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  bill_to_name VARCHAR(120) NOT NULL,
  bill_to_phone VARCHAR(20) NOT NULL,
  bill_to_location TEXT,

  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PAYMENT_DUE',
  notes TEXT,

  is_active BOOLEAN NOT NULL DEFAULT true,
  inactive_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_invoices_created_at
  ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number
  ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id
  ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status
  ON public.invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_is_active
  ON public.invoices(is_active);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
      AND policyname = 'Service role access only'
  ) THEN
    CREATE POLICY "Service role access only" ON public.invoices
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

GRANT USAGE, SELECT ON SEQUENCE public.invoice_number_seq TO service_role;
GRANT EXECUTE ON FUNCTION public.next_invoice_number() TO service_role;
