-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Patient Information
  patient_name VARCHAR(100) NOT NULL,
  patient_age INTEGER NOT NULL CHECK (patient_age >= 1 AND patient_age <= 120),
  patient_phone VARCHAR(20) NOT NULL,
  patient_location VARCHAR(120) NOT NULL,

  -- Appointment Details
  consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('home', 'online')),
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(20) NOT NULL,

  -- Status & Tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  idempotency_key VARCHAR(100) UNIQUE,

  -- Notifications
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  whatsapp_message_id VARCHAR(100),
  whatsapp_error TEXT,

  -- Consent
  privacy_consent BOOLEAN NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_phone ON appointments(patient_phone);
CREATE INDEX idx_appointments_date ON appointments(preferred_date);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX idx_appointments_idempotency ON appointments(idempotency_key);

-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL,

  idempotency_key VARCHAR(100) UNIQUE,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message_id VARCHAR(100),
  whatsapp_error TEXT,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_idempotency ON feedback(idempotency_key);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access
CREATE POLICY "Service role access only" ON appointments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role access only" ON feedback
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
