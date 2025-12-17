-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  whatsapp TEXT,
  cpf TEXT,
  email TEXT,
  
  -- Health Plan
  health_plan TEXT,
  plan_number TEXT,
  
  -- Evolution/WhatsApp Data  
  evolution_instance_id TEXT,
  whatsapp_number TEXT,
  last_message_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(cpf, '') || ' ' || coalesce(whatsapp, ''))
  ) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_whatsapp ON patients(whatsapp);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- RLS Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see patients from their own clinic
CREATE POLICY "Users can view their clinic's patients"
  ON patients FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert patients to their clinic
CREATE POLICY "Users can insert patients to their clinic"
  ON patients FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update their clinic's patients
CREATE POLICY "Users can update their clinic's patients"
  ON patients FOR UPDATE
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can delete their clinic's patients
CREATE POLICY "Users can delete their clinic's patients"
  ON patients FOR DELETE
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Insert mock data (will be inserted after getting clinic_id)
-- This is just the structure, actual insertion will be done via Supabase client
COMMENT ON TABLE patients IS 'Stores patient/customer information from WhatsApp and manual entry';
