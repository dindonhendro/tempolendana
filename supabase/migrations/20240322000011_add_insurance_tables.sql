CREATE TABLE IF NOT EXISTS insurance_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insurance_company_id UUID REFERENCES insurance_companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL DEFAULT 'Staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  insurance_company_id UUID REFERENCES insurance_companies(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  policy_document_url TEXT,
  policy_number TEXT,
  coverage_amount DECIMAL(15,2),
  premium_amount DECIMAL(15,2),
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Policy Uploaded', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table insurance_companies;
alter publication supabase_realtime add table insurance_staff;
alter publication supabase_realtime add table insurance_assignments;

-- Insert dummy insurance companies for testing
INSERT INTO insurance_companies (name, code, email, phone, address, license_number) VALUES
('PT Asuransi Jasa Indonesia (Jasindo)', 'JASINDO', 'info@jasindo.co.id', '021-3983-8888', 'Jl. Letjen M.T. Haryono Kav. 35, Jakarta Selatan', 'ASR-001-2020'),
('PT Asuransi Sinar Mas', 'SIMAS', 'customer@simasinsurindo.co.id', '021-2953-9999', 'Jl. Jend. Sudirman Kav. 61-62, Jakarta Pusat', 'ASR-002-2020'),
('PT Asuransi Central Asia', 'ACA', 'info@aca.co.id', '021-2358-8888', 'Wisma Mulia Lt. 20, Jl. Jend. Gatot Subroto Kav. 42, Jakarta Selatan', 'ASR-003-2020'),
('PT Asuransi Bintang', 'BINTANG', 'info@asuransibintang.com', '021-3190-7777', 'Jl. Kebon Sirih No. 71, Jakarta Pusat', 'ASR-004-2020'),
('PT Asuransi Ramayana', 'RAMAYANA', 'info@asuransiramayana.co.id', '021-3504-5555', 'Jl. Kebon Sirih Raya No. 34, Jakarta Pusat', 'ASR-005-2020');
