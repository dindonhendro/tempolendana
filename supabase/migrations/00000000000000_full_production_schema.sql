-- ============================================================================
-- LENDANA FINANCIAL ACCESS PLATFORM
-- Complete Production Database Schema for Self-Hosted Supabase
-- ============================================================================
-- Version: 1.0.0
-- Date: January 2025
-- Description: Comprehensive SQL migration script for production deployment
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 2: CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'user', 
    'wirausaha', 
    'perusahaan', 
    'agent', 
    'checker_agent', 
    'validator', 
    'bank_staff', 
    'insurance', 
    'collector', 
    'admin'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.users IS 'Main users table linked to Supabase auth.users';
COMMENT ON COLUMN public.users.role IS 'User role: user, wirausaha, perusahaan, agent, checker_agent, validator, bank_staff, insurance, collector, admin';

-- ----------------------------------------------------------------------------
-- 2.2 BANKS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.banks IS 'Partner banks for loan products';

-- ----------------------------------------------------------------------------
-- 2.3 BANK BRANCHES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.bank_branches IS 'Bank branch offices';

-- ----------------------------------------------------------------------------
-- 2.4 BANK PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PMI', 'Livestock', 'Farmers', 'SME', 'Housing')),
  min_amount BIGINT NOT NULL,
  max_amount BIGINT NOT NULL,
  min_tenor INTEGER NOT NULL,
  max_tenor INTEGER NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  product_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.bank_products IS 'Loan products offered by partner banks';
COMMENT ON COLUMN public.bank_products.type IS 'Product type: PMI, Livestock, Farmers, SME, Housing';

-- ----------------------------------------------------------------------------
-- 2.5 BANK STAFF TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.bank_branches(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

COMMENT ON TABLE public.bank_staff IS 'Bank staff members linked to users';

-- ----------------------------------------------------------------------------
-- 2.6 AGENT COMPANIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.agent_companies IS 'Agent companies (P3MI) for loan processing';

-- ----------------------------------------------------------------------------
-- 2.7 AGENT STAFF TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_company_id UUID REFERENCES public.agent_companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

COMMENT ON TABLE public.agent_staff IS 'Agent staff members linked to agent companies';

-- ----------------------------------------------------------------------------
-- 2.8 INSURANCE COMPANIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.insurance_companies IS 'Insurance partner companies';

-- ----------------------------------------------------------------------------
-- 2.9 INSURANCE STAFF TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  insurance_company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

COMMENT ON TABLE public.insurance_staff IS 'Insurance staff members';

-- ----------------------------------------------------------------------------
-- 2.10 COLLECTOR COMPANIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collector_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  license_number VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.collector_companies IS 'Collection partner companies';

-- ----------------------------------------------------------------------------
-- 2.11 COLLECTOR STAFF TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collector_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collector_company_id UUID NOT NULL REFERENCES public.collector_companies(id) ON DELETE CASCADE,
  position VARCHAR(100) DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

COMMENT ON TABLE public.collector_staff IS 'Collector staff members';

-- ============================================================================
-- SECTION 3: LOAN APPLICATION TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 LOAN APPLICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  birth_place TEXT,
  birth_date DATE,
  phone_number TEXT,
  email TEXT,
  nik_ktp TEXT,
  last_education TEXT,
  nomor_sisko TEXT,
  address_ktp TEXT,
  address_domicile TEXT,
  other_certifications TEXT,
  
  -- Family Information
  nama_ibu_kandung TEXT,
  nama_pasangan TEXT,
  ktp_pasangan TEXT,
  telp_pasangan TEXT,
  alamat_pasangan TEXT,
  
  -- Education & Work
  institution TEXT,
  major TEXT,
  work_experience TEXT,
  work_location TEXT,
  nama_pemberi_kerja TEXT,
  telp_pemberi_kerja TEXT,
  alamat_pemberi_kerja TEXT,
  tanggal_keberangkatan DATE,
  negara_penempatan TEXT,
  
  -- Loan Details
  loan_amount BIGINT,
  tenor_months INTEGER,
  bunga_bank DECIMAL(5,2) DEFAULT 6.00,
  grace_period INTEGER,
  
  -- Status & Workflow
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN (
    'Submitted', 
    'Under Review', 
    'Checked', 
    'Validated', 
    'Bank Approved', 
    'Bank Rejected', 
    'Rejected',
    'Insured',
    'Disbursed',
    'Active',
    'Overdue',
    'Completed'
  )),
  submission_type TEXT DEFAULT 'PMI' CHECK (submission_type IN ('PMI', 'Livestock', 'Farmers', 'SME', 'Housing')),
  
  -- Agent Assignment
  assigned_agent_id UUID REFERENCES public.agent_companies(id),
  
  -- Validation & Approval
  validated_by_lendana UUID REFERENCES public.users(id),
  validated_by_lendana_at TIMESTAMP WITH TIME ZONE,
  bank_approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Document URLs
  ktp_photo_url TEXT,
  self_photo_url TEXT,
  dokumen_persetujuan_data_privacy_url TEXT,
  surat_permohonan_kredit_url TEXT,
  dokumen_kartu_keluarga_url TEXT,
  dokumen_paspor_url TEXT,
  dokumen_surat_nikah_url TEXT,
  pas_foto_3x4_url TEXT,
  dokumen_ktp_keluarga_penjamin_url TEXT,
  surat_pernyataan_ortu_wali_url TEXT,
  surat_izin_ortu_wali_url TEXT,
  dokumen_perjanjian_penempatan_pmi_url TEXT,
  dokumen_perjanjian_kerja_url TEXT,
  surat_keterangan_p3mi_url TEXT,
  info_slik_bank_url TEXT,
  dokumen_standing_instruction_url TEXT,
  dokumen_lain_1_url TEXT,
  dokumen_lain_2_url TEXT,
  
  -- Audit Fields
  ip_address INET,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.loan_applications IS 'Main loan applications table';
COMMENT ON COLUMN public.loan_applications.transaction_id IS 'Unique transaction ID for tracking (format: YYMMDDXXXX)';
COMMENT ON COLUMN public.loan_applications.ip_address IS 'IP address of the user when submitting the loan application';

-- ----------------------------------------------------------------------------
-- 3.2 BRANCH APPLICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branch_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.bank_branches(id) ON DELETE CASCADE,
  bank_product_id UUID REFERENCES public.bank_products(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.branch_applications IS 'Loan applications assigned to bank branches';

-- ----------------------------------------------------------------------------
-- 3.3 BANK REVIEWS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_application_id UUID REFERENCES public.branch_applications(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES public.bank_staff(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Approved', 'Rejected')),
  comments TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.bank_reviews IS 'Bank review decisions for loan applications';

-- ----------------------------------------------------------------------------
-- 3.4 INSURANCE ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  insurance_company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  policy_document_url TEXT,
  policy_number TEXT,
  coverage_amount DECIMAL(15,2),
  premium_amount DECIMAL(15,2),
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Policy Uploaded', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.insurance_assignments IS 'Insurance assignments for approved loans';

-- ----------------------------------------------------------------------------
-- 3.5 COLLECTOR ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collector_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  collector_company_id UUID NOT NULL REFERENCES public.collector_companies(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.collector_assignments IS 'Collector assignments for loan collection';

-- ----------------------------------------------------------------------------
-- 3.6 KOMPONEN BIAYA TABLE (PMI Cost Components)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.komponen_biaya (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Biaya persiapan penempatan
  biaya_pelatihan INTEGER DEFAULT 0,
  biaya_sertifikasi INTEGER DEFAULT 0,
  biaya_jasa_perusahaan INTEGER DEFAULT 0,
  biaya_transportasi_lokal INTEGER DEFAULT 0,
  biaya_visa_kerja INTEGER DEFAULT 0,
  biaya_tiket_keberangkatan INTEGER DEFAULT 0,
  biaya_tiket_pulang INTEGER DEFAULT 0,
  biaya_akomodasi INTEGER DEFAULT 0,
  
  -- Biaya berkaitan dengan penempatan
  biaya_pemeriksaan_kesehatan INTEGER DEFAULT 0,
  biaya_jaminan_sosial INTEGER DEFAULT 0,
  biaya_apostille INTEGER DEFAULT 0,
  
  -- Biaya lain-lain
  biaya_lain_lain_1 INTEGER DEFAULT 0,
  biaya_lain_lain_2 INTEGER DEFAULT 0,
  keterangan_biaya_lain TEXT,
  
  -- Calculated totals
  total_biaya_persiapan INTEGER GENERATED ALWAYS AS (
    biaya_pelatihan + biaya_sertifikasi + biaya_jasa_perusahaan + 
    biaya_transportasi_lokal + biaya_visa_kerja + biaya_tiket_keberangkatan + 
    biaya_tiket_pulang + biaya_akomodasi
  ) STORED,
  
  total_biaya_penempatan INTEGER GENERATED ALWAYS AS (
    biaya_pemeriksaan_kesehatan + biaya_jaminan_sosial + biaya_apostille
  ) STORED,
  
  total_biaya_lain_lain INTEGER GENERATED ALWAYS AS (
    biaya_lain_lain_1 + biaya_lain_lain_2
  ) STORED,
  
  total_keseluruhan INTEGER GENERATED ALWAYS AS (
    biaya_pelatihan + biaya_sertifikasi + biaya_jasa_perusahaan + 
    biaya_transportasi_lokal + biaya_visa_kerja + biaya_tiket_keberangkatan + 
    biaya_tiket_pulang + biaya_akomodasi + biaya_pemeriksaan_kesehatan + 
    biaya_jaminan_sosial + biaya_apostille + biaya_lain_lain_1 + biaya_lain_lain_2
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.komponen_biaya IS 'Tabel untuk menyimpan komponen biaya PMI dari form aplikasi';

-- ============================================================================
-- SECTION 4: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Banks indexes
CREATE INDEX IF NOT EXISTS idx_banks_code ON public.banks(code);
CREATE INDEX IF NOT EXISTS idx_banks_is_active ON public.banks(is_active);

-- Bank branches indexes
CREATE INDEX IF NOT EXISTS idx_bank_branches_bank_id ON public.bank_branches(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_branches_city ON public.bank_branches(city);

-- Bank products indexes
CREATE INDEX IF NOT EXISTS idx_bank_products_bank_id ON public.bank_products(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_products_type ON public.bank_products(type);

-- Bank staff indexes
CREATE INDEX IF NOT EXISTS idx_bank_staff_user_id ON public.bank_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_staff_bank_id ON public.bank_staff(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_staff_branch_id ON public.bank_staff(branch_id);

-- Agent companies indexes
CREATE INDEX IF NOT EXISTS idx_agent_companies_code ON public.agent_companies(code);

-- Agent staff indexes
CREATE INDEX IF NOT EXISTS idx_agent_staff_user_id ON public.agent_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_staff_company_id ON public.agent_staff(agent_company_id);

-- Insurance indexes
CREATE INDEX IF NOT EXISTS idx_insurance_staff_user_id ON public.insurance_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_staff_company_id ON public.insurance_staff(insurance_company_id);

-- Collector indexes
CREATE INDEX IF NOT EXISTS idx_collector_staff_user_id ON public.collector_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_collector_staff_company_id ON public.collector_staff(collector_company_id);

-- Loan applications indexes
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON public.loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_submission_type ON public.loan_applications(submission_type);
CREATE INDEX IF NOT EXISTS idx_loan_applications_assigned_agent ON public.loan_applications(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_transaction_id ON public.loan_applications(transaction_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON public.loan_applications(created_at);

-- Branch applications indexes
CREATE INDEX IF NOT EXISTS idx_branch_applications_loan_id ON public.branch_applications(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_branch_applications_branch_id ON public.branch_applications(branch_id);

-- Bank reviews indexes
CREATE INDEX IF NOT EXISTS idx_bank_reviews_branch_app_id ON public.bank_reviews(branch_application_id);
CREATE INDEX IF NOT EXISTS idx_bank_reviews_reviewed_by ON public.bank_reviews(reviewed_by);

-- Insurance assignments indexes
CREATE INDEX IF NOT EXISTS idx_insurance_assignments_loan_id ON public.insurance_assignments(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_insurance_assignments_company_id ON public.insurance_assignments(insurance_company_id);

-- Collector assignments indexes
CREATE INDEX IF NOT EXISTS idx_collector_assignments_loan_id ON public.collector_assignments(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_collector_assignments_company_id ON public.collector_assignments(collector_company_id);

-- Komponen biaya indexes
CREATE INDEX IF NOT EXISTS idx_komponen_biaya_loan_application_id ON public.komponen_biaya(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_komponen_biaya_user_id ON public.komponen_biaya(user_id);
CREATE INDEX IF NOT EXISTS idx_komponen_biaya_created_at ON public.komponen_biaya(created_at);

-- ============================================================================
-- SECTION 5: FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Transaction ID Generator
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    random_suffix TEXT;
    new_transaction_id TEXT;
    id_exists BOOLEAN;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    
    LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        new_transaction_id := date_part || random_suffix;
        
        SELECT EXISTS(
            SELECT 1 FROM public.loan_applications 
            WHERE transaction_id = new_transaction_id
        ) INTO id_exists;
        
        IF NOT id_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_transaction_id() IS 'Generates unique transaction ID in format YYMMDDXXXX';

-- ----------------------------------------------------------------------------
-- 5.2 Auto-generate Transaction ID Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_generate_transaction_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_id IS NULL THEN
        NEW.transaction_id := generate_transaction_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_transaction_id ON public.loan_applications;
CREATE TRIGGER trigger_auto_transaction_id
    BEFORE INSERT ON public.loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_transaction_id();

-- ----------------------------------------------------------------------------
-- 5.3 Updated At Trigger Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_banks_updated_at ON public.banks;
CREATE TRIGGER trigger_banks_updated_at
    BEFORE UPDATE ON public.banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bank_branches_updated_at ON public.bank_branches;
CREATE TRIGGER trigger_bank_branches_updated_at
    BEFORE UPDATE ON public.bank_branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bank_products_updated_at ON public.bank_products;
CREATE TRIGGER trigger_bank_products_updated_at
    BEFORE UPDATE ON public.bank_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bank_staff_updated_at ON public.bank_staff;
CREATE TRIGGER trigger_bank_staff_updated_at
    BEFORE UPDATE ON public.bank_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_agent_companies_updated_at ON public.agent_companies;
CREATE TRIGGER trigger_agent_companies_updated_at
    BEFORE UPDATE ON public.agent_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_agent_staff_updated_at ON public.agent_staff;
CREATE TRIGGER trigger_agent_staff_updated_at
    BEFORE UPDATE ON public.agent_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_insurance_companies_updated_at ON public.insurance_companies;
CREATE TRIGGER trigger_insurance_companies_updated_at
    BEFORE UPDATE ON public.insurance_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_insurance_staff_updated_at ON public.insurance_staff;
CREATE TRIGGER trigger_insurance_staff_updated_at
    BEFORE UPDATE ON public.insurance_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_collector_companies_updated_at ON public.collector_companies;
CREATE TRIGGER trigger_collector_companies_updated_at
    BEFORE UPDATE ON public.collector_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_collector_staff_updated_at ON public.collector_staff;
CREATE TRIGGER trigger_collector_staff_updated_at
    BEFORE UPDATE ON public.collector_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_loan_applications_updated_at ON public.loan_applications;
CREATE TRIGGER trigger_loan_applications_updated_at
    BEFORE UPDATE ON public.loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_branch_applications_updated_at ON public.branch_applications;
CREATE TRIGGER trigger_branch_applications_updated_at
    BEFORE UPDATE ON public.branch_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bank_reviews_updated_at ON public.bank_reviews;
CREATE TRIGGER trigger_bank_reviews_updated_at
    BEFORE UPDATE ON public.bank_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_insurance_assignments_updated_at ON public.insurance_assignments;
CREATE TRIGGER trigger_insurance_assignments_updated_at
    BEFORE UPDATE ON public.insurance_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_collector_assignments_updated_at ON public.collector_assignments;
CREATE TRIGGER trigger_collector_assignments_updated_at
    BEFORE UPDATE ON public.collector_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_komponen_biaya_updated_at ON public.komponen_biaya;
CREATE TRIGGER trigger_komponen_biaya_updated_at
    BEFORE UPDATE ON public.komponen_biaya
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.komponen_biaya ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6.1 USERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.users;
CREATE POLICY "Allow insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 6.2 BANKS POLICIES (Public read, Admin write)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Banks are viewable by everyone" ON public.banks;
CREATE POLICY "Banks are viewable by everyone" ON public.banks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage banks" ON public.banks;
CREATE POLICY "Admins can manage banks" ON public.banks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.3 BANK BRANCHES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Bank branches are viewable by everyone" ON public.bank_branches;
CREATE POLICY "Bank branches are viewable by everyone" ON public.bank_branches
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage bank branches" ON public.bank_branches;
CREATE POLICY "Admins can manage bank branches" ON public.bank_branches
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.4 BANK PRODUCTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Bank products are viewable by everyone" ON public.bank_products;
CREATE POLICY "Bank products are viewable by everyone" ON public.bank_products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage bank products" ON public.bank_products;
CREATE POLICY "Admins can manage bank products" ON public.bank_products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.5 BANK STAFF POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Bank staff can view own record" ON public.bank_staff;
CREATE POLICY "Bank staff can view own record" ON public.bank_staff
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage bank staff" ON public.bank_staff;
CREATE POLICY "Admins can manage bank staff" ON public.bank_staff
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.6 AGENT COMPANIES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Agent companies are viewable by authenticated users" ON public.agent_companies;
CREATE POLICY "Agent companies are viewable by authenticated users" ON public.agent_companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage agent companies" ON public.agent_companies;
CREATE POLICY "Admins can manage agent companies" ON public.agent_companies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.7 AGENT STAFF POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Agent staff can view own record" ON public.agent_staff;
CREATE POLICY "Agent staff can view own record" ON public.agent_staff
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage agent staff" ON public.agent_staff;
CREATE POLICY "Admins can manage agent staff" ON public.agent_staff
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.8 INSURANCE COMPANIES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Insurance companies are viewable by authenticated users" ON public.insurance_companies;
CREATE POLICY "Insurance companies are viewable by authenticated users" ON public.insurance_companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage insurance companies" ON public.insurance_companies;
CREATE POLICY "Admins can manage insurance companies" ON public.insurance_companies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.9 INSURANCE STAFF POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Insurance staff can view own record" ON public.insurance_staff;
CREATE POLICY "Insurance staff can view own record" ON public.insurance_staff
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage insurance staff" ON public.insurance_staff;
CREATE POLICY "Admins can manage insurance staff" ON public.insurance_staff
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.10 COLLECTOR COMPANIES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Collector companies are viewable by authenticated users" ON public.collector_companies;
CREATE POLICY "Collector companies are viewable by authenticated users" ON public.collector_companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage collector companies" ON public.collector_companies;
CREATE POLICY "Admins can manage collector companies" ON public.collector_companies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.11 COLLECTOR STAFF POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Collector staff can view own record" ON public.collector_staff;
CREATE POLICY "Collector staff can view own record" ON public.collector_staff
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage collector staff" ON public.collector_staff;
CREATE POLICY "Admins can manage collector staff" ON public.collector_staff
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.12 LOAN APPLICATIONS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own loan applications" ON public.loan_applications;
CREATE POLICY "Users can view own loan applications" ON public.loan_applications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create loan applications" ON public.loan_applications;
CREATE POLICY "Users can create loan applications" ON public.loan_applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pending applications" ON public.loan_applications;
CREATE POLICY "Users can update own pending applications" ON public.loan_applications
    FOR UPDATE USING (user_id = auth.uid() AND status = 'Submitted');

DROP POLICY IF EXISTS "Agents can view assigned applications" ON public.loan_applications;
CREATE POLICY "Agents can view assigned applications" ON public.loan_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.agent_staff ast ON ast.user_id = u.id
            WHERE u.id = auth.uid() 
            AND u.role IN ('agent', 'checker_agent')
            AND ast.agent_company_id = loan_applications.assigned_agent_id
        )
    );

DROP POLICY IF EXISTS "Validators can view all applications" ON public.loan_applications;
CREATE POLICY "Validators can view all applications" ON public.loan_applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'validator')
    );

DROP POLICY IF EXISTS "Validators can update applications" ON public.loan_applications;
CREATE POLICY "Validators can update applications" ON public.loan_applications
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'validator')
    );

DROP POLICY IF EXISTS "Bank staff can view applications for their bank" ON public.loan_applications;
CREATE POLICY "Bank staff can view applications for their bank" ON public.loan_applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'bank_staff')
    );

DROP POLICY IF EXISTS "Bank staff can update applications" ON public.loan_applications;
CREATE POLICY "Bank staff can update applications" ON public.loan_applications
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'bank_staff')
    );

DROP POLICY IF EXISTS "Admins can manage all loan applications" ON public.loan_applications;
CREATE POLICY "Admins can manage all loan applications" ON public.loan_applications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.13 BRANCH APPLICATIONS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;
CREATE POLICY "Branch applications viewable by relevant users" ON public.branch_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'validator', 'bank_staff')
        )
    );

DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
CREATE POLICY "Admins can manage branch applications" ON public.branch_applications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.14 BANK REVIEWS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Bank reviews viewable by relevant users" ON public.bank_reviews;
CREATE POLICY "Bank reviews viewable by relevant users" ON public.bank_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'validator', 'bank_staff')
        )
    );

DROP POLICY IF EXISTS "Bank staff can create reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can create reviews" ON public.bank_reviews
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'bank_staff')
    );

DROP POLICY IF EXISTS "Admins can manage bank reviews" ON public.bank_reviews;
CREATE POLICY "Admins can manage bank reviews" ON public.bank_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- 6.15 INSURANCE ASSIGNMENTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Insurance assignments viewable by relevant users" ON public.insurance_assignments;
CREATE POLICY "Insurance assignments viewable by relevant users" ON public.insurance_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'insurance', 'bank_staff')
        )
    );

DROP POLICY IF EXISTS "Insurance staff can manage assignments" ON public.insurance_assignments;
CREATE POLICY "Insurance staff can manage assignments" ON public.insurance_assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'insurance'))
    );

-- ----------------------------------------------------------------------------
-- 6.16 COLLECTOR ASSIGNMENTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Collector assignments viewable by relevant users" ON public.collector_assignments;
CREATE POLICY "Collector assignments viewable by relevant users" ON public.collector_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'collector', 'bank_staff')
        )
    );

DROP POLICY IF EXISTS "Collectors can manage assignments" ON public.collector_assignments;
CREATE POLICY "Collectors can manage assignments" ON public.collector_assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'collector'))
    );

-- ----------------------------------------------------------------------------
-- 6.17 KOMPONEN BIAYA POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own komponen biaya" ON public.komponen_biaya;
CREATE POLICY "Users can view own komponen biaya" ON public.komponen_biaya
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create komponen biaya" ON public.komponen_biaya;
CREATE POLICY "Users can create komponen biaya" ON public.komponen_biaya
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own komponen biaya" ON public.komponen_biaya;
CREATE POLICY "Users can update own komponen biaya" ON public.komponen_biaya
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all komponen biaya" ON public.komponen_biaya;
CREATE POLICY "Admins can manage all komponen biaya" ON public.komponen_biaya
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- SECTION 7: STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('loan-documents', 'loan-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for loan-documents bucket
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'loan-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'loan-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Staff can view all documents" ON storage.objects;
CREATE POLICY "Staff can view all documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'loan-documents'
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'agent', 'checker_agent', 'validator', 'bank_staff', 'insurance', 'collector')
        )
    );

-- ============================================================================
-- SECTION 8: REALTIME SUBSCRIPTIONS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'banks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE banks;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bank_branches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bank_branches;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bank_products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bank_products;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bank_staff'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bank_staff;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'loan_applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE loan_applications;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'branch_applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE branch_applications;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bank_reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bank_reviews;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'agent_companies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE agent_companies;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'agent_staff'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE agent_staff;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'insurance_companies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE insurance_companies;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'insurance_staff'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE insurance_staff;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'insurance_assignments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE insurance_assignments;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'collector_companies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE collector_companies;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'collector_staff'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE collector_staff;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'collector_assignments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE collector_assignments;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'komponen_biaya'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE komponen_biaya;
    END IF;
END $$;

-- ============================================================================
-- SECTION 9: SEED DATA (Partner Banks)
-- ============================================================================

INSERT INTO public.banks (name, code, logo_url, is_active) VALUES
('Bank Negara Indonesia', 'BNI', '/images/banks/bni.png', true),
('Bank Mandiri', 'MANDIRI', '/images/banks/mandiri.png', true),
('Bank Rakyat Indonesia', 'BRI', '/images/banks/bri.png', true),
('Bank Tabungan Negara', 'BTN', '/images/banks/btn.png', true),
('Bank Nano', 'NANO', '/images/banks/nano.png', true),
('Bank Perkreditan Rakyat', 'BPR', '/images/banks/bpr.png', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Insurance Companies
INSERT INTO public.insurance_companies (name, code, email, phone, address, license_number) VALUES
('PT Asuransi Jasa Indonesia (Jasindo)', 'JASINDO', 'info@jasindo.co.id', '021-3983-8888', 'Jl. Letjen M.T. Haryono Kav. 35, Jakarta Selatan', 'ASR-001-2020'),
('PT Asuransi Sinar Mas', 'SIMAS', 'customer@simasinsurindo.co.id', '021-2953-9999', 'Jl. Jend. Sudirman Kav. 61-62, Jakarta Pusat', 'ASR-002-2020'),
('PT Asuransi Central Asia', 'ACA', 'info@aca.co.id', '021-2358-8888', 'Wisma Mulia Lt. 20, Jl. Jend. Gatot Subroto Kav. 42, Jakarta Selatan', 'ASR-003-2020'),
('PT Asuransi Bintang', 'BINTANG', 'info@asuransibintang.com', '021-3190-7777', 'Jl. Kebon Sirih No. 71, Jakarta Pusat', 'ASR-004-2020'),
('PT Asuransi Ramayana', 'RAMAYANA', 'info@asuransiramayana.co.id', '021-3504-5555', 'Jl. Kebon Sirih Raya No. 34, Jakarta Pusat', 'ASR-005-2020')
ON CONFLICT (code) DO NOTHING;

-- Seed Collector Companies
INSERT INTO public.collector_companies (name, code, email, phone, address, license_number) VALUES
('PT Koleksi Prima', 'KP001', 'info@koleksiprima.com', '+62-21-1234567', 'Jl. Sudirman No. 123, Jakarta', 'COL-2024-001'),
('CV Tagihan Mandiri', 'TM002', 'contact@tagihanmandiri.co.id', '+62-21-7654321', 'Jl. Thamrin No. 456, Jakarta', 'COL-2024-002'),
('PT Penagihan Profesional', 'PP003', 'admin@penagihanpro.com', '+62-21-9876543', 'Jl. Gatot Subroto No. 789, Jakarta', 'COL-2024-003')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SECTION 10: GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
-- 
-- NOTES FOR PRODUCTION DEPLOYMENT:
-- 
-- 1. Run this script on a fresh Supabase self-hosted instance
-- 2. Ensure auth.users table exists (created by Supabase Auth)
-- 3. Update storage bucket policies as needed for your security requirements
-- 4. Review and adjust RLS policies based on your specific access control needs
-- 5. Add additional seed data for bank branches and products as needed
-- 6. Configure SMTP for email authentication
-- 7. Set up proper backup and recovery procedures
-- 
-- For questions or issues, contact: engineering@lendana.co.id
-- ============================================================================
