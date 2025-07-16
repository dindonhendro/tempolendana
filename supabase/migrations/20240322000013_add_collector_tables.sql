-- Add collector role to users table constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'agent', 'bank_staff', 'validator', 'insurance', 'collector'));

-- Create collector_companies table
CREATE TABLE IF NOT EXISTS collector_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  license_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collector_staff table
CREATE TABLE IF NOT EXISTS collector_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collector_company_id UUID NOT NULL REFERENCES collector_companies(id) ON DELETE CASCADE,
  position VARCHAR(100) DEFAULT 'Staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create collector_assignments table
CREATE TABLE IF NOT EXISTS collector_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  collector_company_id UUID NOT NULL REFERENCES collector_companies(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for new tables
alter publication supabase_realtime add table collector_companies;
alter publication supabase_realtime add table collector_staff;
alter publication supabase_realtime add table collector_assignments;

-- Insert sample collector companies
INSERT INTO collector_companies (name, code, email, phone, address, license_number) VALUES
('PT Koleksi Prima', 'KP001', 'info@koleksiprimacom', '+62-21-1234567', 'Jl. Sudirman No. 123, Jakarta', 'COL-2024-001'),
('CV Tagihan Mandiri', 'TM002', 'contact@tagihanmandiri.co.id', '+62-21-7654321', 'Jl. Thamrin No. 456, Jakarta', 'COL-2024-002'),
('PT Penagihan Profesional', 'PP003', 'admin@penagihanpro.com', '+62-21-9876543', 'Jl. Gatot Subroto No. 789, Jakarta', 'COL-2024-003')
ON CONFLICT (code) DO NOTHING;
