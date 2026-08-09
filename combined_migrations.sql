-- ==========================================
-- FILE: 00000000000000_full_production_schema.sql
-- ==========================================

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


-- ==========================================
-- FILE: 20250125000001_add_data_immutability_hash.sql
-- ==========================================

-- ============================================================================
-- LENDANA FINANCIAL ACCESS PLATFORM
-- Data Immutability Implementation with SHA-256 Hash
-- ============================================================================
-- Version: 1.0.0
-- Date: January 2025
-- Description: Implements immutable records for submitted loan applications
--              with SHA-256 hash verification for bank and OJK audit
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD DATA_HASH COLUMN
-- ============================================================================

ALTER TABLE loan_applications
ADD COLUMN IF NOT EXISTS data_hash TEXT;

COMMENT ON COLUMN loan_applications.data_hash IS 'SHA-256 hash of canonical JSON representation of the row at submission time. Used for immutability verification and audit.';

-- ============================================================================
-- SECTION 2: ENABLE PGCRYPTO EXTENSION (for digest function)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- SECTION 3: FUNCTION TO COMPUTE SHA-256 HASH OF CANONICAL JSON
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_loan_application_hash(p_loan_application_id UUID)
RETURNS TEXT AS $$
DECLARE
    row_data JSONB;
    canonical_json TEXT;
    hash_val TEXT;
    sorted_keys TEXT[];
    key_val RECORD;
    result_json JSONB := '{}'::JSONB;
BEGIN
    SELECT to_jsonb(la.*) - 'data_hash' - 'updated_at'
    INTO row_data
    FROM loan_applications la
    WHERE la.id = p_loan_application_id;

    IF row_data IS NULL THEN
        RAISE EXCEPTION 'Loan application with id % not found', p_loan_application_id;
    END IF;

    SELECT ARRAY_AGG(key ORDER BY key)
    INTO sorted_keys
    FROM jsonb_object_keys(row_data) AS key;

    FOR key_val IN
        SELECT key, row_data -> key AS value
        FROM unnest(sorted_keys) AS key
    LOOP
        result_json := result_json || jsonb_build_object(key_val.key, key_val.value);
    END LOOP;

    canonical_json := result_json::TEXT;

    hash_val := encode(digest(canonical_json, 'sha256'), 'hex');

    RETURN hash_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION compute_loan_application_hash(UUID) IS 'Computes SHA-256 hash of canonical JSON representation of loan application row (excluding data_hash and updated_at columns)';

-- ============================================================================
-- SECTION 4: FUNCTION TO UPDATE HASH IN TABLE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_loan_application_hash(p_loan_application_id UUID)
RETURNS VOID AS $$
DECLARE
    hash_val TEXT;
BEGIN
    hash_val := compute_loan_application_hash(p_loan_application_id);

    UPDATE loan_applications
    SET data_hash = hash_val
    WHERE id = p_loan_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_loan_application_hash(UUID) IS 'Updates the data_hash column with computed SHA-256 hash';

-- ============================================================================
-- SECTION 5: TRIGGER FUNCTION TO PREVENT MODIFICATION OF IMMUTABLE ROWS
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_immutable_loan_update()
RETURNS TRIGGER AS $$
DECLARE
    col_name TEXT;
    old_val TEXT;
    new_val TEXT;
    excluded_columns TEXT[] := ARRAY['updated_at', 'data_hash', 'status', 'bank_approved_at'];
BEGIN
    -- Only prevent changes when status is 'Validated' (immutable state)
    IF OLD.status = 'Validated' AND OLD.data_hash IS NOT NULL THEN
        FOR col_name IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'loan_applications'
              AND column_name != ALL(excluded_columns)
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', col_name, col_name)
            INTO old_val, new_val
            USING OLD, NEW;

            IF old_val IS DISTINCT FROM new_val THEN
                RAISE EXCEPTION 'Data aplikasi anda saat ini sedang di proses LJK pemberi pinjaman sehingga tidak dapat diubah lagi. Kolom "%" tidak dapat diubah.', col_name;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION prevent_immutable_loan_update() IS 'Prevents modification of loan applications that have been validated (status = Validated with data_hash set). Applications with status Submitted or Checked can still be edited.';

-- ============================================================================
-- SECTION 6: TRIGGER FUNCTION TO GENERATE HASH ON SUBMIT
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_hash_on_loan_submit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Validated' AND (OLD.status IS NULL OR OLD.status IS DISTINCT FROM 'Validated') THEN
        IF NEW.data_hash IS NULL THEN
            NEW.data_hash := compute_loan_application_hash(NEW.id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_hash_on_loan_submit() IS 'Automatically generates SHA-256 hash when loan application status changes to Validated';

-- ============================================================================
-- SECTION 7: CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_prevent_immutable_loan_update ON loan_applications;
CREATE TRIGGER trg_prevent_immutable_loan_update
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION prevent_immutable_loan_update();

DROP TRIGGER IF EXISTS trg_generate_hash_on_loan_submit ON loan_applications;
CREATE TRIGGER trg_generate_hash_on_loan_submit
    BEFORE INSERT OR UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_hash_on_loan_submit();

-- ============================================================================
-- SECTION 8: AUDIT TABLE FOR LOAN APPLICATION CHANGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS loan_applications_audit (
    audit_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SUBMIT')),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    old_hash TEXT,
    new_hash TEXT,
    ip_address INET,
    user_agent TEXT
);

COMMENT ON TABLE loan_applications_audit IS 'Audit trail for all changes to loan applications, especially for OJK compliance';

CREATE INDEX IF NOT EXISTS idx_loan_audit_application_id ON loan_applications_audit(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_loan_audit_changed_at ON loan_applications_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_loan_audit_action ON loan_applications_audit(action);

-- ============================================================================
-- SECTION 9: AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_loan_application_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_action TEXT;
    v_changed_by UUID;
BEGIN
    v_changed_by := auth.uid();

    IF TG_OP = 'INSERT' THEN
        audit_action := 'INSERT';
        INSERT INTO loan_applications_audit (
            loan_application_id,
            action,
            changed_by,
            new_data,
            new_hash,
            ip_address
        ) VALUES (
            NEW.id,
            audit_action,
            v_changed_by,
            to_jsonb(NEW),
            NEW.data_hash,
            NEW.ip_address
        );
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'Validated' AND OLD.status IS DISTINCT FROM 'Validated' THEN
            audit_action := 'SUBMIT';
        ELSE
            audit_action := 'UPDATE';
        END IF;

        INSERT INTO loan_applications_audit (
            loan_application_id,
            action,
            changed_by,
            old_data,
            new_data,
            old_hash,
            new_hash,
            ip_address
        ) VALUES (
            NEW.id,
            audit_action,
            v_changed_by,
            to_jsonb(OLD),
            to_jsonb(NEW),
            OLD.data_hash,
            NEW.data_hash,
            NEW.ip_address
        );
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        INSERT INTO loan_applications_audit (
            loan_application_id,
            action,
            changed_by,
            old_data,
            old_hash
        ) VALUES (
            OLD.id,
            audit_action,
            v_changed_by,
            to_jsonb(OLD),
            OLD.data_hash
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_loan_application ON loan_applications;
CREATE TRIGGER trg_audit_loan_application
    AFTER INSERT OR UPDATE OR DELETE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION audit_loan_application_changes();

-- ============================================================================
-- SECTION 10: VERIFIED VIEW FOR SUBMITTED APPLICATIONS
-- ============================================================================

CREATE OR REPLACE VIEW loan_applications_verified AS
SELECT
    la.id,
    la.transaction_id,
    la.user_id,
    la.full_name,
    la.nik_ktp,
    la.phone_number,
    la.email,
    la.loan_amount,
    la.tenor_months,
    la.status,
    la.submission_type,
    la.negara_penempatan,
    la.assigned_agent_id,
    la.validated_by_lendana,
    la.validated_by_lendana_at,
    la.bank_approved_at,
    la.data_hash,
    la.created_at,
    la.updated_at,
    CASE
        WHEN la.data_hash = compute_loan_application_hash(la.id) THEN TRUE
        ELSE FALSE
    END AS hash_verified
FROM loan_applications la
WHERE la.status = 'Validated'
  AND la.data_hash IS NOT NULL;

COMMENT ON VIEW loan_applications_verified IS 'View of submitted loan applications with hash verification status for bank and OJK audit';

-- ============================================================================
-- SECTION 11: FUNCTION TO VERIFY HASH INTEGRITY
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_loan_application_hash(p_loan_application_id UUID)
RETURNS TABLE (
    application_id UUID,
    transaction_id TEXT,
    stored_hash TEXT,
    computed_hash TEXT,
    is_valid BOOLEAN,
    status TEXT
) AS $$
DECLARE
    v_stored_hash TEXT;
    v_computed_hash TEXT;
    v_status TEXT;
    v_transaction_id TEXT;
BEGIN
    SELECT la.data_hash, la.status, la.transaction_id
    INTO v_stored_hash, v_status, v_transaction_id
    FROM loan_applications la
    WHERE la.id = p_loan_application_id;

    IF v_stored_hash IS NULL THEN
        RETURN QUERY SELECT
            p_loan_application_id,
            v_transaction_id,
            v_stored_hash,
            NULL::TEXT,
            FALSE,
            v_status;
        RETURN;
    END IF;

    v_computed_hash := compute_loan_application_hash(p_loan_application_id);

    RETURN QUERY SELECT
        p_loan_application_id,
        v_transaction_id,
        v_stored_hash,
        v_computed_hash,
        (v_stored_hash = v_computed_hash),
        v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_loan_application_hash(UUID) IS 'Verifies the integrity of a loan application by comparing stored hash with computed hash';

-- ============================================================================
-- SECTION 12: RLS POLICIES FOR IMMUTABILITY
-- ============================================================================

DROP POLICY IF EXISTS "Prevent modification of submitted loan applications" ON loan_applications;
CREATE POLICY "Prevent modification of submitted loan applications"
ON loan_applications
FOR UPDATE
USING (
    status != 'Validated'
    OR data_hash IS NULL
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

ALTER TABLE loan_applications_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs viewable by admin and validators" ON loan_applications_audit;
CREATE POLICY "Audit logs viewable by admin and validators"
ON loan_applications_audit
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'validator', 'bank_staff')
    )
);

DROP POLICY IF EXISTS "Audit logs insert only by system" ON loan_applications_audit;
CREATE POLICY "Audit logs insert only by system"
ON loan_applications_audit
FOR INSERT
WITH CHECK (TRUE);

-- ============================================================================
-- SECTION 13: GRANTS
-- ============================================================================

GRANT SELECT ON loan_applications_verified TO authenticated;
GRANT SELECT ON loan_applications_audit TO authenticated;
GRANT EXECUTE ON FUNCTION verify_loan_application_hash(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_loan_application_hash(UUID) TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
--
-- WORKFLOW EXPLANATION:
--
-- 1. User submits loan application via frontend
-- 2. Frontend calls: supabase.from('loan_applications').update({ status: 'Submitted' })
-- 3. Trigger trg_generate_hash_on_loan_submit fires BEFORE UPDATE
--    - Computes SHA-256 hash of canonical JSON (sorted keys, excluding data_hash & updated_at)
--    - Stores hash in data_hash column
-- 4. Trigger trg_audit_loan_application fires AFTER UPDATE
--    - Records the change in loan_applications_audit table with action = 'SUBMIT'
-- 5. Any subsequent UPDATE attempts on submitted rows:
--    - Trigger trg_prevent_immutable_loan_update fires BEFORE UPDATE
--    - Compares all columns (except updated_at, data_hash)
--    - If any change detected, raises exception: "Immutable record—submitted applications cannot be modified"
-- 6. Bank/OJK can verify integrity using:
--    - SELECT * FROM loan_applications_verified (includes hash_verified column)
--    - SELECT * FROM verify_loan_application_hash('application-uuid')
--
-- SECURITY NOTES:
-- - Hash is computed server-side via PostgreSQL triggers (no client manipulation possible)
-- - RLS policies prevent modification of submitted records
-- - Audit table tracks all changes for compliance
-- - Only admin role can bypass immutability (for emergency corrections with full audit trail)
--
-- ============================================================================


-- ==========================================
-- FILE: 20250126000001_fix_hash_trigger.sql
-- ==========================================

-- ============================================================================
-- FIX: Hash Computation in BEFORE Trigger
-- ============================================================================
-- Problem: compute_loan_application_hash() tries to SELECT from table,
--          but in BEFORE trigger, the row hasn't been updated yet.
-- Solution: Create a new function that computes hash from NEW record directly.
-- ============================================================================

-- ============================================================================
-- SECTION 1: NEW FUNCTION TO COMPUTE HASH FROM RECORD (not from SELECT)
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_hash_from_record(p_record loan_applications)
RETURNS TEXT AS $$
DECLARE
    row_data JSONB;
    canonical_json TEXT;
    hash_val TEXT;
    sorted_keys TEXT[];
    key_val RECORD;
    result_json JSONB := '{}'::JSONB;
BEGIN
    row_data := to_jsonb(p_record) - 'data_hash' - 'updated_at';

    SELECT ARRAY_AGG(key ORDER BY key)
    INTO sorted_keys
    FROM jsonb_object_keys(row_data) AS key;

    FOR key_val IN
        SELECT key, row_data -> key AS value
        FROM unnest(sorted_keys) AS key
    LOOP
        result_json := result_json || jsonb_build_object(key_val.key, key_val.value);
    END LOOP;

    canonical_json := result_json::TEXT;

    hash_val := encode(digest(canonical_json, 'sha256'), 'hex');

    RETURN hash_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION compute_hash_from_record(loan_applications) IS 'Computes SHA-256 hash from a loan_applications record directly (for use in BEFORE triggers)';

-- ============================================================================
-- SECTION 2: UPDATE THE TRIGGER FUNCTION TO USE NEW HASH FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_hash_on_loan_submit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Validated' AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status IS DISTINCT FROM 'Validated') THEN
        IF NEW.data_hash IS NULL THEN
            NEW.data_hash := compute_hash_from_record(NEW);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 3: UPDATE compute_loan_application_hash FOR VERIFICATION (AFTER commit)
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_loan_application_hash(p_loan_application_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_record loan_applications%ROWTYPE;
BEGIN
    SELECT * INTO v_record
    FROM loan_applications
    WHERE id = p_loan_application_id;

    IF v_record.id IS NULL THEN
        RAISE EXCEPTION 'Loan application with id % not found', p_loan_application_id;
    END IF;

    RETURN compute_hash_from_record(v_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: RECREATE TRIGGERS WITH CORRECT ORDER
-- ============================================================================

DROP TRIGGER IF EXISTS trg_generate_hash_on_loan_submit ON loan_applications;
DROP TRIGGER IF EXISTS trg_prevent_immutable_loan_update ON loan_applications;

CREATE TRIGGER trg_generate_hash_on_loan_submit
    BEFORE INSERT OR UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_hash_on_loan_submit();

CREATE TRIGGER trg_prevent_immutable_loan_update
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION prevent_immutable_loan_update();

-- ============================================================================
-- END OF FIX
-- ============================================================================


-- ==========================================
-- FILE: 20250127000001_create_user_registration_logs.sql
-- ==========================================

-- Migration: Create user_registration_logs table for OJK compliance
-- Purpose: Log all user registration activities including IP address and device information

CREATE TABLE IF NOT EXISTS user_registration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  country TEXT,
  city TEXT,
  registration_status TEXT DEFAULT 'success' CHECK (registration_status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_registration_logs_user_id ON user_registration_logs(user_id);
CREATE INDEX idx_user_registration_logs_email ON user_registration_logs(email);
CREATE INDEX idx_user_registration_logs_ip_address ON user_registration_logs(ip_address);
CREATE INDEX idx_user_registration_logs_created_at ON user_registration_logs(created_at);

COMMENT ON TABLE user_registration_logs IS 'Log semua aktivitas registrasi user untuk keperluan audit OJK';
COMMENT ON COLUMN user_registration_logs.user_id IS 'Reference ke auth.users.id';
COMMENT ON COLUMN user_registration_logs.email IS 'Email user yang mendaftar';
COMMENT ON COLUMN user_registration_logs.ip_address IS 'IP address user saat registrasi';
COMMENT ON COLUMN user_registration_logs.user_agent IS 'Full user agent string dari browser';
COMMENT ON COLUMN user_registration_logs.device_type IS 'Tipe device: mobile, tablet, desktop';
COMMENT ON COLUMN user_registration_logs.registration_status IS 'Status registrasi: success, failed, pending';

-- Create view untuk monitoring registrasi
CREATE OR REPLACE VIEW v_registration_logs_summary AS
SELECT 
  DATE(created_at) as registration_date,
  role,
  registration_status,
  COUNT(*) as total_registrations,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT email) as unique_emails
FROM user_registration_logs
GROUP BY DATE(created_at), role, registration_status
ORDER BY registration_date DESC, role;

COMMENT ON VIEW v_registration_logs_summary IS 'Summary registrasi user per hari untuk monitoring dan reporting ke OJK';


-- ==========================================
-- FILE: 20250128000001_create_user_consent_logs.sql
-- ==========================================

-- Migration: Create user_consent_logs table for OJK compliance
-- Purpose: Log all user consent activities for privacy policy and other documents

CREATE TABLE IF NOT EXISTS user_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('privacy_policy', 'terms_of_service', 'data_processing')),
  document_version TEXT DEFAULT '1.0',
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'api')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_consent_logs_user_id ON user_consent_logs(user_id);
CREATE INDEX idx_user_consent_logs_document_type ON user_consent_logs(document_type);
CREATE INDEX idx_user_consent_logs_consent_at ON user_consent_logs(consent_at);

COMMENT ON TABLE user_consent_logs IS 'Log semua persetujuan user untuk keperluan audit OJK';
COMMENT ON COLUMN user_consent_logs.user_id IS 'Reference ke auth.users.id';
COMMENT ON COLUMN user_consent_logs.document_type IS 'Jenis dokumen: privacy_policy, terms_of_service, data_processing';
COMMENT ON COLUMN user_consent_logs.document_version IS 'Versi dokumen yang disetujui';
COMMENT ON COLUMN user_consent_logs.consent_given IS 'Status persetujuan user';
COMMENT ON COLUMN user_consent_logs.consent_at IS 'Timestamp saat user memberikan persetujuan';
COMMENT ON COLUMN user_consent_logs.ip_address IS 'IP address user saat memberikan persetujuan';
COMMENT ON COLUMN user_consent_logs.user_agent IS 'User agent browser saat memberikan persetujuan';
COMMENT ON COLUMN user_consent_logs.source IS 'Sumber persetujuan: web, mobile, api';

-- Enable RLS
ALTER TABLE user_consent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own consent logs
DROP POLICY IF EXISTS "Users can read own consent logs" ON user_consent_logs;
CREATE POLICY "Users can read own consent logs" ON user_consent_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can read all consent logs (for admin/audit)
DROP POLICY IF EXISTS "Service role can read all consent logs" ON user_consent_logs;
CREATE POLICY "Service role can read all consent logs" ON user_consent_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Allow insert for authenticated users (their own consent)
DROP POLICY IF EXISTS "Users can insert own consent logs" ON user_consent_logs;
CREATE POLICY "Users can insert own consent logs" ON user_consent_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin can read all consent logs
DROP POLICY IF EXISTS "Admin can read all consent logs" ON user_consent_logs;
CREATE POLICY "Admin can read all consent logs" ON user_consent_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create view for consent summary reporting
CREATE OR REPLACE VIEW v_consent_logs_summary AS
SELECT 
  DATE(consent_at) as consent_date,
  document_type,
  COUNT(*) as total_consents,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN consent_given THEN 1 ELSE 0 END) as consents_given,
  SUM(CASE WHEN NOT consent_given THEN 1 ELSE 0 END) as consents_denied
FROM user_consent_logs
GROUP BY DATE(consent_at), document_type
ORDER BY consent_date DESC, document_type;

COMMENT ON VIEW v_consent_logs_summary IS 'Summary persetujuan user per hari untuk monitoring dan reporting ke OJK';


-- ==========================================
-- FILE: 20250129000001_fix_user_consent_logs_rls.sql
-- ==========================================

-- Migration: Fix RLS for user_consent_logs to allow insert during registration
-- The issue: During registration, the user is not yet authenticated so auth.uid() returns null
-- Solution: Disable RLS for this table since it's an audit/compliance table that needs to log all consent

ALTER TABLE user_consent_logs DISABLE ROW LEVEL SECURITY;

-- Note: RLS is disabled because:
-- 1. This is a compliance/audit table for OJK
-- 2. Consent needs to be logged during registration before user is fully authenticated
-- 3. Read policies can still be enforced at application level
-- 4. Service role is used for administrative access


-- ==========================================
-- FILE: 20250130000001_sync_auth_users.sql
-- ==========================================

-- Function to handle new user creation in public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on every auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Manually sync existing users from auth.users to public.users
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  COALESCE(raw_user_meta_data->>'role', 'user') as role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Specifically ensure ananda1@lendana.id is an admin if they exist in auth
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'ananda1@lendana.id';

-- Also update auth.users metadata for ananda1@lendana.id just in case
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb 
WHERE email = 'ananda1@lendana.id';


-- ==========================================
-- FILE: 20250131000001_fix_recursive_policies.sql
-- ==========================================

-- Helper function to check user roles without recursion
-- SECURITY DEFINER allows this function to bypass RLS and read the users table
CREATE OR REPLACE FUNCTION public.has_role(target_role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = target_role
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper function for multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(target_roles text[])
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = ANY(target_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 1. Fix public.users policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (public.has_role('admin'));

-- 2. Fix public.banks policies
DROP POLICY IF EXISTS "Admins can manage banks" ON public.banks;
CREATE POLICY "Admins can manage banks" ON public.banks
    FOR ALL USING (public.has_role('admin'));

-- 3. Fix public.bank_branches policies
DROP POLICY IF EXISTS "Admins can manage bank branches" ON public.bank_branches;
CREATE POLICY "Admins can manage bank branches" ON public.bank_branches
    FOR ALL USING (public.has_role('admin'));

-- 4. Fix public.bank_products policies
DROP POLICY IF EXISTS "Admins can manage bank products" ON public.bank_products;
CREATE POLICY "Admins can manage bank products" ON public.bank_products
    FOR ALL USING (public.has_role('admin'));

-- 5. Fix public.bank_staff policies
DROP POLICY IF EXISTS "Admins can manage bank staff" ON public.bank_staff;
CREATE POLICY "Admins can manage bank staff" ON public.bank_staff
    FOR ALL USING (public.has_role('admin'));

-- 6. Fix public.agent_companies policies
DROP POLICY IF EXISTS "Admins can manage agent companies" ON public.agent_companies;
CREATE POLICY "Admins can manage agent companies" ON public.agent_companies
    FOR ALL USING (public.has_role('admin'));

-- 7. Fix public.agent_staff policies
DROP POLICY IF EXISTS "Admins can manage agent staff" ON public.agent_staff;
CREATE POLICY "Admins can manage agent staff" ON public.agent_staff
    FOR ALL USING (public.has_role('admin'));

-- 8. Fix public.insurance_companies policies
DROP POLICY IF EXISTS "Admins can manage insurance companies" ON public.insurance_companies;
CREATE POLICY "Admins can manage insurance companies" ON public.insurance_companies
    FOR ALL USING (public.has_role('admin'));

-- 9. Fix public.insurance_staff policies
DROP POLICY IF EXISTS "Admins can manage insurance staff" ON public.insurance_staff;
CREATE POLICY "Admins can manage insurance staff" ON public.insurance_staff
    FOR ALL USING (public.has_role('admin'));

-- 10. Fix public.collector_companies policies
DROP POLICY IF EXISTS "Admins can manage collector companies" ON public.collector_companies;
CREATE POLICY "Admins can manage collector companies" ON public.collector_companies
    FOR ALL USING (public.has_role('admin'));

-- 11. Fix public.collector_staff policies
DROP POLICY IF EXISTS "Admins can manage collector staff" ON public.collector_staff;
CREATE POLICY "Admins can manage collector staff" ON public.collector_staff
    FOR ALL USING (public.has_role('admin'));

-- 12. Fix public.loan_applications policies
DROP POLICY IF EXISTS "Agents can view assigned applications" ON public.loan_applications;
CREATE POLICY "Agents can view assigned applications" ON public.loan_applications
    FOR SELECT USING (
        public.has_any_role(ARRAY['agent', 'checker_agent']) AND
        EXISTS (
            SELECT 1 FROM public.agent_staff ast 
            WHERE ast.user_id = auth.uid() 
            AND ast.agent_company_id = loan_applications.assigned_agent_id
        )
    );

DROP POLICY IF EXISTS "Validators can view all applications" ON public.loan_applications;
CREATE POLICY "Validators can view all applications" ON public.loan_applications
    FOR SELECT USING (public.has_role('validator'));

DROP POLICY IF EXISTS "Validators can update applications" ON public.loan_applications;
CREATE POLICY "Validators can update applications" ON public.loan_applications
    FOR UPDATE USING (public.has_role('validator'));

DROP POLICY IF EXISTS "Bank staff can view applications for their bank" ON public.loan_applications;
CREATE POLICY "Bank staff can view applications for their bank" ON public.loan_applications
    FOR SELECT USING (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Bank staff can update applications" ON public.loan_applications;
CREATE POLICY "Bank staff can update applications" ON public.loan_applications
    FOR UPDATE USING (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Admins can manage all loan applications" ON public.loan_applications;
CREATE POLICY "Admins can manage all loan applications" ON public.loan_applications
    FOR ALL USING (public.has_role('admin'));

-- 13. Fix branch_applications policies
DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;
CREATE POLICY "Branch applications viewable by relevant users" ON public.branch_applications
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
CREATE POLICY "Admins can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_role('admin'));

-- 14. Fix bank_reviews policies
DROP POLICY IF EXISTS "Bank reviews viewable by relevant users" ON public.bank_reviews;
CREATE POLICY "Bank reviews viewable by relevant users" ON public.bank_reviews
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Bank staff can create reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can create reviews" ON public.bank_reviews
    FOR INSERT WITH CHECK (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Admins can manage bank reviews" ON public.bank_reviews;
CREATE POLICY "Admins can manage bank reviews" ON public.bank_reviews
    FOR ALL USING (public.has_role('admin'));

-- 15. Fix insurance_assignments policies
DROP POLICY IF EXISTS "Insurance assignments viewable by relevant users" ON public.insurance_assignments;
CREATE POLICY "Insurance assignments viewable by relevant users" ON public.insurance_assignments
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'insurance', 'bank_staff']));

DROP POLICY IF EXISTS "Insurance staff can manage assignments" ON public.insurance_assignments;
CREATE POLICY "Insurance staff can manage assignments" ON public.insurance_assignments
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'insurance']));

-- 16. Fix collector_assignments policies
DROP POLICY IF EXISTS "Collector assignments viewable by relevant users" ON public.collector_assignments;
CREATE POLICY "Collector assignments viewable by relevant users" ON public.collector_assignments
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'collector', 'bank_staff']));

DROP POLICY IF EXISTS "Collectors can manage assignments" ON public.collector_assignments;
CREATE POLICY "Collectors can manage assignments" ON public.collector_assignments
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'collector']));


-- ==========================================
-- FILE: 20260120000001_create_support_tickets_table.sql
-- ==========================================

-- ----------------------------------------------------------------------------
-- CREATE SUPPORT TICKETS TABLE (OJK Request)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  application_id TEXT,
  complaint_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON public.support_tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- RLS Policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public complaint form)
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;
CREATE POLICY "Anyone can create support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (true);

-- Users can view their own tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view and manage all tickets
DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated At Trigger
DROP TRIGGER IF EXISTS trigger_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trigger_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.support_tickets IS 'Customer complaints and ticketing system for OJK compliance';


-- ==========================================
-- FILE: 20260120000002_global_audit_trail.sql
-- ==========================================

-- ----------------------------------------------------------------------------
-- GLOBAL SYSTEM AUDIT TRAIL (OJK Compliance)
-- ----------------------------------------------------------------------------
-- Version: 1.0.0
-- Description: Unified logging for all critical system activities.
-- Features: Immutable (Insert-only), SHA-256 Hashing, User context tracking.

-- 1. Create Global Audit Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, DOWNLOAD, etc.
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    client_info JSONB, -- IP, User-Agent, Device info
    severity TEXT DEFAULT 'INFO', -- INFO, WARN, CRITICAL
    log_hash TEXT, -- SHA-256 integrity hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Prevent Tampering (Immutability)
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit logs are append-only" ON public.system_audit_logs;
CREATE POLICY "Audit logs are append-only" ON public.system_audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'validator'))
    );

DROP POLICY IF EXISTS "System can insert logs" ON public.system_audit_logs;
CREATE POLICY "System can insert logs" ON public.system_audit_logs
    FOR INSERT WITH CHECK (true);

-- Prevent Updates or Deletes on Audit Logs
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit trail records are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_modification
BEFORE UPDATE OR DELETE ON public.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

-- 3. Integrity Hashing Function
CREATE OR REPLACE FUNCTION public.compute_audit_log_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.log_hash := encode(digest(
        concat(
            NEW.id, 
            NEW.event_timestamp, 
            NEW.actor_id, 
            NEW.action_type, 
            NEW.table_name, 
            NEW.old_data::text, 
            NEW.new_data::text
        ), 'sha256'
    ), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_audit_log_hash
BEFORE INSERT ON public.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.compute_audit_log_hash();

-- 4. Generic Trigger Function for All Tables
CREATE OR REPLACE FUNCTION public.global_track_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_action TEXT;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    -- Get User ID from Supabase Auth context
    v_actor_id := auth.uid();
    v_action := TG_OP;

    IF (TG_OP = 'UPDATE') THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'INSERT') THEN
        v_new := to_jsonb(NEW);
    END IF;

    INSERT INTO public.system_audit_logs (
        actor_id,
        action_type,
        table_name,
        record_id,
        old_data,
        new_data,
        severity
    ) VALUES (
        v_actor_id,
        v_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_old,
        v_new,
        CASE WHEN v_action = 'DELETE' THEN 'WARN' ELSE 'INFO' END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Apply to Critical Tables
-- Apply to Users
DROP TRIGGER IF EXISTS trg_audit_users ON public.users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.global_track_changes();

-- Apply to Loan Applications
DROP TRIGGER IF EXISTS trg_audit_loan_applications ON public.loan_applications;
CREATE TRIGGER trg_audit_loan_applications
AFTER INSERT OR UPDATE OR DELETE ON public.loan_applications
FOR EACH ROW EXECUTE FUNCTION public.global_track_changes();

-- Apply to Support Tickets
DROP TRIGGER IF EXISTS trg_audit_support_tickets ON public.support_tickets;
CREATE TRIGGER trg_audit_support_tickets
AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.global_track_changes();

COMMENT ON TABLE public.system_audit_logs IS 'Global immutable audit trail for OJK compliance requirements';


-- ==========================================
-- FILE: 20260129000002_update_handle_new_user_trigger.sql
-- ==========================================

-- Migration: Update handle_new_user trigger to handle staff tables and avoid RLS issues
-- Purpose: Automatically create entries in agent_staff, bank_staff, etc. based on user metadata during signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_company_id uuid;
  v_bank_id uuid;
  v_branch_id uuid;
BEGIN
  -- Extract role
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');

  -- Insert/Update public.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role);

  -- Extract metadata safely
  BEGIN
    v_company_id := NULLIF(new.raw_user_meta_data->>'company_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  BEGIN
    v_bank_id := NULLIF(new.raw_user_meta_data->>'bank_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_bank_id := NULL;
  END;

  BEGIN
    v_branch_id := NULLIF(new.raw_user_meta_data->>'branch_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_branch_id := NULL;
  END;

  -- Create staff records based on role
  IF v_role IN ('agent', 'checker_agent') AND v_company_id IS NOT NULL THEN
    INSERT INTO public.agent_staff (user_id, agent_company_id, position)
    VALUES (new.id, v_company_id, CASE WHEN v_role = 'checker_agent' THEN 'Checker Agent' ELSE 'Agent' END)
    ON CONFLICT (user_id) DO UPDATE SET
      agent_company_id = EXCLUDED.agent_company_id,
      position = EXCLUDED.position;
  ELSIF v_role = 'bank_staff' AND v_bank_id IS NOT NULL AND v_branch_id IS NOT NULL THEN
    INSERT INTO public.bank_staff (user_id, bank_id, branch_id, position)
    VALUES (new.id, v_bank_id, v_branch_id, 'Staff')
    ON CONFLICT (user_id) DO UPDATE SET
      bank_id = EXCLUDED.bank_id,
      branch_id = EXCLUDED.branch_id;
  ELSIF v_role = 'insurance' AND v_company_id IS NOT NULL THEN
    INSERT INTO public.insurance_staff (user_id, insurance_company_id, position)
    VALUES (new.id, v_company_id, 'Staff')
    ON CONFLICT (user_id) DO UPDATE SET
      insurance_company_id = EXCLUDED.insurance_company_id;
  ELSIF v_role = 'collector' AND v_company_id IS NOT NULL THEN
    INSERT INTO public.collector_staff (user_id, collector_company_id, position)
    VALUES (new.id, v_company_id, 'Staff')
    ON CONFLICT (user_id) DO UPDATE SET
      collector_company_id = EXCLUDED.collector_company_id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- FILE: 20260303000001_fix_bank_management_policies.sql
-- ==========================================

-- Fix: Grant missing permissions and add missing policies for branch_applications, bank_reviews,
-- bank_branches, bank_products, and bank_staff tables
-- Also adds missing tenor columns to bank_products and fixes type constraint

-- 1. Grant table permissions
GRANT SELECT ON public.branch_applications TO anon, authenticated;
GRANT INSERT, UPDATE ON public.branch_applications TO authenticated;
GRANT SELECT ON public.bank_reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.bank_reviews TO authenticated;
GRANT ALL ON public.branch_applications TO service_role;
GRANT ALL ON public.bank_reviews TO service_role;

-- 2. Fix branch_applications policies
DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;
CREATE POLICY "Branch applications viewable by relevant users" ON public.branch_applications
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
CREATE POLICY "Admins can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Validators can insert branch applications" ON public.branch_applications;
CREATE POLICY "Validators can insert branch applications" ON public.branch_applications
    FOR INSERT WITH CHECK (public.has_role('validator'));

DROP POLICY IF EXISTS "Staff can manage branch applications" ON public.branch_applications;
CREATE POLICY "Staff can manage branch applications" ON public.branch_applications
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']))
    WITH CHECK (public.has_any_role(ARRAY['admin', 'validator']));

-- 3. Fix bank_reviews policies
DROP POLICY IF EXISTS "Bank reviews viewable by relevant users" ON public.bank_reviews;
CREATE POLICY "Bank reviews viewable by relevant users" ON public.bank_reviews
    FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));

DROP POLICY IF EXISTS "Bank staff can create reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can create reviews" ON public.bank_reviews
    FOR INSERT WITH CHECK (public.has_role('bank_staff'));

DROP POLICY IF EXISTS "Admins can manage bank reviews" ON public.bank_reviews;
CREATE POLICY "Admins can manage bank reviews" ON public.bank_reviews
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank staff can manage reviews" ON public.bank_reviews;
CREATE POLICY "Bank staff can manage reviews" ON public.bank_reviews
    FOR ALL USING (public.has_any_role(ARRAY['admin', 'bank_staff']))
    WITH CHECK (public.has_any_role(ARRAY['admin', 'bank_staff']));

-- 4. Fix bank_branches - add admin management policy
DROP POLICY IF EXISTS "Admins can manage bank branches" ON public.bank_branches;
CREATE POLICY "Admins can manage bank branches" ON public.bank_branches
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank branches are viewable by everyone" ON public.bank_branches;
DROP POLICY IF EXISTS "Bank branches are viewable by all authenticated" ON public.bank_branches;
CREATE POLICY "Bank branches are viewable by all authenticated" ON public.bank_branches
    FOR SELECT USING (true);

-- 5. Fix bank_products - add admin management policy  
DROP POLICY IF EXISTS "Admins can manage bank products" ON public.bank_products;
CREATE POLICY "Admins can manage bank products" ON public.bank_products
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank products are viewable by everyone" ON public.bank_products;
DROP POLICY IF EXISTS "Bank products are viewable by all authenticated" ON public.bank_products;
CREATE POLICY "Bank products are viewable by all authenticated" ON public.bank_products
    FOR SELECT USING (true);

-- 6. Fix bank_staff - add admin management policy
DROP POLICY IF EXISTS "Admins can manage bank staff" ON public.bank_staff;
CREATE POLICY "Admins can manage bank staff" ON public.bank_staff
    FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Bank staff can view their own record" ON public.bank_staff;
CREATE POLICY "Bank staff can view their own record" ON public.bank_staff
    FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin'));

-- 7. Add missing columns to bank_products
ALTER TABLE public.bank_products 
    ADD COLUMN IF NOT EXISTS min_tenor INTEGER,
    ADD COLUMN IF NOT EXISTS max_tenor INTEGER,
    ADD COLUMN IF NOT EXISTS description TEXT;

-- 8. Add missing phone column to bank_branches
ALTER TABLE public.bank_branches
    ADD COLUMN IF NOT EXISTS phone TEXT;

-- 9. Fix bank_products type constraint to allow all expected loan types
ALTER TABLE public.bank_products 
    DROP CONSTRAINT IF EXISTS bank_products_type_check;

ALTER TABLE public.bank_products
    ADD CONSTRAINT bank_products_type_check 
    CHECK (type = ANY(ARRAY[
        'PMI'::text, 'Livestock'::text, 'Farmers'::text, 'SME'::text, 'Housing'::text,
        'KUR'::text, 'Personal Loan'::text, 'Business Loan'::text, 'Mortgage'::text
    ]));

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260303000002_add_validator_columns.sql
-- ==========================================

-- Fix: Add missing validator columns to loan_applications

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS validated_by_lendana UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS validated_by_lendana_at TIMESTAMP WITH TIME ZONE;


-- ==========================================
-- FILE: 20260303000003_add_rpc_hash.sql
-- ==========================================

-- Fix: Add compute_loan_application_hash function and data_hash column

-- 1. Add data_hash column if it doesn't exist
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS data_hash TEXT;

-- 2. Enable pgcrypto if possible
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Create the hash computation function
CREATE OR REPLACE FUNCTION public.compute_loan_application_hash(p_loan_application_id UUID)
RETURNS TEXT AS $$
DECLARE
    app_data RECORD;
    hash_input TEXT;
    result_hash TEXT;
BEGIN
    -- Get the application data
    SELECT 
        id, transaction_id, full_name, nik_ktp, phone_number, email, 
        loan_amount, tenor_months, status, submission_type
    INTO app_data
    FROM public.loan_applications
    WHERE id = p_loan_application_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan application not found';
    END IF;

    -- Create a concatenated string of the important fields
    hash_input := app_data.id::TEXT || '|' ||
                  COALESCE(app_data.transaction_id, '') || '|' ||
                  COALESCE(app_data.full_name, '') || '|' ||
                  COALESCE(app_data.nik_ktp, '') || '|' ||
                  COALESCE(app_data.loan_amount::TEXT, '') || '|' ||
                  COALESCE(app_data.tenor_months::TEXT, '') || '|' ||
                  COALESCE(app_data.submission_type, '');

    -- Compute SHA-256 hash using pgcrypto if possible
    BEGIN
        result_hash := encode(digest(hash_input, 'sha256'), 'hex');
    EXCEPTION WHEN OTHERS THEN
        -- Fallback if pgcrypto is not available - just return a simple base64 hash of the inputs for now
        result_hash := encode(convert_to(hash_input, 'UTF8'), 'base64');
    END;

    RETURN result_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.compute_loan_application_hash(UUID) TO authenticated;

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260401000001_add_bank_columns_to_loan_applications.sql
-- ==========================================

-- Migration to add bank selection columns directly to the loan_applications table

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.banks(id),
ADD COLUMN IF NOT EXISTS bank_product_id UUID REFERENCES public.bank_products(id),
ADD COLUMN IF NOT EXISTS bank_branch_id UUID REFERENCES public.bank_branches(id);

-- Add helpful comments for these columns
COMMENT ON COLUMN public.loan_applications.bank_id IS 'Selected partner bank for the loan';
COMMENT ON COLUMN public.loan_applications.bank_product_id IS 'Selected loan product';
COMMENT ON COLUMN public.loan_applications.bank_branch_id IS 'Selected bank branch';

-- Create an index to improve query performance for these columns
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_id ON public.loan_applications(bank_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_product_id ON public.loan_applications(bank_product_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_bank_branch_id ON public.loan_applications(bank_branch_id);

-- Force PostgREST to reload the schema cache so the API immediately recognizes the new columns
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260401000002_encrypt_nik_ktp.sql
-- ==========================================

-- Migration file to implement zero-risk field level encryption for NIK KTP
-- File: supabase/migrations/20260401000002_encrypt_nik_ktp.sql

-- 1. Pastikan ekstensi pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Menambahkan kolom ciphertext 'nik_ktp_enc' (bertipe BYTEA) dengan aman
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS nik_ktp_enc BYTEA;

COMMENT ON COLUMN loan_applications.nik_ktp_enc IS 'Ciphertext NIK KTP yang dienkripsikan oleh pgcrypto untuk kepentingan keamanan data.';

-- 3. Membuat fungsi trigger agar data NIK otomatis ter-enkripsi setiap disisipkan/diubah
CREATE OR REPLACE FUNCTION encrypt_nik_ktp_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  -- Menggunakan secret_key: 'Hw_780378'
  IF NEW.nik_ktp IS NOT NULL THEN
    NEW.nik_ktp_enc := pgp_sym_encrypt(NEW.nik_ktp, 'Hw_780378');
  ELSE
    NEW.nik_ktp_enc := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Menghapus trigger lama jika ada
DROP TRIGGER IF EXISTS tr_encrypt_nik_ktp ON loan_applications;

-- Menempelkan trigger ke event INSERT dan UPDATE
CREATE TRIGGER tr_encrypt_nik_ktp
BEFORE INSERT OR UPDATE OF nik_ktp
ON loan_applications
FOR EACH ROW
EXECUTE FUNCTION encrypt_nik_ktp_trigger_func();

-- 4. Melakukan enkripsi masal pada data existing yang belum terenkripsi (Zero Risk copy)
-- Menonaktifkan sementara trigger keamanan immutability pada saat migrasi struktur
ALTER TABLE loan_applications DISABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications DISABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications DISABLE TRIGGER trg_audit_loan_application;

-- Mengubah data untuk memicu trigger enkripsi baru
UPDATE loan_applications
SET nik_ktp = nik_ktp
WHERE nik_ktp IS NOT NULL AND nik_ktp_enc IS NULL;

-- Memperbarui nilai hash SHA-256 agar valid dengan struktur kolom baru (ada nik_ktp_enc)
UPDATE loan_applications
SET data_hash = compute_loan_application_hash(id)
WHERE status = 'Validated';

-- Mengaktifkan kembali trigger keamanan
ALTER TABLE loan_applications ENABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications ENABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications ENABLE TRIGGER trg_audit_loan_application;

-- 5. Membuat Fungsi Dekripsi Otorisasi (RPC) agar frontend/admin bisa melihat plaintext
CREATE OR REPLACE FUNCTION get_decrypted_nik(p_loan_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- Menerjemahkan bytecode kembali menjadi TEXT hanya jika secret_key cocok
  SELECT pgp_sym_decrypt(nik_ktp_enc, 'Hw_780378') INTO v_decrypted
  FROM loan_applications 
  WHERE id = p_loan_id;

  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_decrypted_nik(UUID) IS 'Fungsi khusus berotorisasi untuk mendapatkan NIK KTP asli (dekripsi) dari data yang terenkripsi.';

-- 6. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260401000003_fix_nik_encryption_type.sql
-- ==========================================

-- Migration file to fix data type for NIK KTP encryption
-- File: supabase/migrations/20260401000003_fix_nik_encryption_type.sql

-- 1. Mengubah tipe kolom nik_ktp_enc menjadi BYTEA jika sebelumnya VARCHAR/TEXT
ALTER TABLE loan_applications 
ALTER COLUMN nik_ktp_enc TYPE BYTEA 
USING nik_ktp_enc::bytea;

-- 2. Memperbarui fungsi get_decrypted_nik untuk melakukan eksplisit cast (apabila diperlukan versi pg_crypto tertentu)
CREATE OR REPLACE FUNCTION get_decrypted_nik(p_loan_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- Menerjemahkan bytecode kembali menjadi TEXT
  -- Melakukan cast ::bytea agar terhindar dari error function pgp_sym_decrypt signature
  SELECT pgp_sym_decrypt(nik_ktp_enc::bytea, 'Hw_780378') INTO v_decrypted
  FROM loan_applications 
  WHERE id = p_loan_id;

  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260401000004_rebuild_nik_encryption.sql
-- ==========================================

-- Migration file to completely rebuild NIK KTP encryption column safely
-- File: supabase/migrations/20260401000004_rebuild_nik_encryption.sql

-- 1. Nonaktifkan sementara trigger keamanan (Immutability & Hash)
ALTER TABLE loan_applications DISABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications DISABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications DISABLE TRIGGER trg_audit_loan_application;
-- (Opsional, pastikan trigger encrypt lama kita nonaktifkan agar tak bentrok saat mengubah tipe)
ALTER TABLE loan_applications DISABLE TRIGGER tr_encrypt_nik_ktp;

-- 2. Hapus kolom bermasalah lalu buat kembali sebagai BYTEA tulen
ALTER TABLE loan_applications DROP COLUMN IF EXISTS nik_ktp_enc;
ALTER TABLE loan_applications ADD COLUMN nik_ktp_enc BYTEA;

-- 3. Eksekusi ulang mass encryption dari awal menggunakan plaintext nik_ktp
UPDATE loan_applications
SET nik_ktp_enc = pgp_sym_encrypt(nik_ktp, 'Hw_780378')
WHERE nik_ktp IS NOT NULL;

-- Memperbarui nilai hash SHA-256 (agar kolom baru ter-hashing optimal untuk immutability status 'Validated')
UPDATE loan_applications
SET data_hash = compute_loan_application_hash(id)
WHERE status = 'Validated';

-- 4. Kembalikan fungsi get_decrypted_nik untuk tak perlu repot cast (Murni BYTEA ke pgp_sym_decrypt)
CREATE OR REPLACE FUNCTION get_decrypted_nik(p_loan_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- Kolom nik_ktp_enc kini sudah jaminan BYTEA murni, decrypt langsung
  SELECT pgp_sym_decrypt(nik_ktp_enc, 'Hw_780378') INTO v_decrypted
  FROM loan_applications 
  WHERE id = p_loan_id;

  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Aktifkan ulang seluruh trigger yang dinonaktifkan
ALTER TABLE loan_applications ENABLE TRIGGER tr_encrypt_nik_ktp;
ALTER TABLE loan_applications ENABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications ENABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications ENABLE TRIGGER trg_audit_loan_application;

-- 6. Refresh Schema Supabase
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260725000001_add_delete_own_user_rpc.sql
-- ==========================================

-- Migration: Add RPC function for users to delete their own account safely
-- Purpose: Deletes the authenticated user's record from auth.users, which cascades to delete all related data in public tables.

CREATE OR REPLACE FUNCTION public.delete_own_user()
RETURNS void AS $$
BEGIN
  -- Delete the authenticated user from auth.users
  -- Relational constraints (ON DELETE CASCADE) will handle public.users, loan_applications, etc.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.delete_own_user() IS 'RPC function for a user to delete their own account and all associated profile/application data via cascade.';


-- ==========================================
-- FILE: 20260725000002_add_cs_role_and_support_response.sql
-- ==========================================

-- Migration: Add CS role support and response fields to support_tickets
-- Purpose: Support CS Dashboard and OJK auditing for complaint handling.

-- 1. Update users role check constraint to include 'cs' and existing roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
  role IN ('user', 'agent', 'validator', 'bank_staff', 'insurance', 'collector', 'admin', 'cs', 'wirausaha', 'checker_agent', 'perusahaan')
);

-- 2. Add response fields to support_tickets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS response_details TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES public.users(id);

COMMENT ON COLUMN public.support_tickets.response_details IS 'Jawaban/tindak lanjut tertulis dari Customer Service untuk keluhan ini.';
COMMENT ON COLUMN public.support_tickets.responded_at IS 'Waktu saat CS menyimpan jawaban keluhan.';
COMMENT ON COLUMN public.support_tickets.responded_by IS 'ID User staff CS yang menindaklanjuti keluhan.';

-- 3. Set up RLS policies for CS role
DROP POLICY IF EXISTS "CS can manage all support tickets" ON public.support_tickets;
CREATE POLICY "CS can manage all support tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'cs')
    );

DROP POLICY IF EXISTS "CS can view all consent logs" ON public.user_consent_logs;
CREATE POLICY "CS can view all consent logs" ON public.user_consent_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'cs')
    );

DROP POLICY IF EXISTS "CS can view all users" ON public.users;
CREATE POLICY "CS can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'cs')
    );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- FILE: 20260726000001_add_repayment_fields_to_loan_applications.sql
-- ==========================================

-- Migration: Add repayment and archival fields to loan_applications and update trigger exclusions
-- Purpose: Support active retention OJK tracking and permit manual Bank Staff repayment updates.

-- 1. Add columns to loan_applications
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS repaid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- 1.1 Update status check constraint to allow 'Completed', 'Disbursed', 'Active', 'Overdue'
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_status_check;
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_status_check CHECK (
  status IN (
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
  )
);

COMMENT ON COLUMN public.loan_applications.repaid_at IS 'Tanggal pelunasan pinjaman secara penuh.';
COMMENT ON COLUMN public.loan_applications.is_archived IS 'Flag apakah data pengisian nasabah sudah dianonimkan setelah melewati batas retensi 3 bulan.';
COMMENT ON COLUMN public.loan_applications.archived_at IS 'Tanggal dilakukannya pengarsipan/anonimisasi.';

-- 2. Update prevent_immutable_loan_update trigger function to exclude new fields
CREATE OR REPLACE FUNCTION prevent_immutable_loan_update()
RETURNS TRIGGER AS $$
DECLARE
    col_name TEXT;
    old_val TEXT;
    new_val TEXT;
    excluded_columns TEXT[] := ARRAY['updated_at', 'data_hash', 'status', 'bank_approved_at', 'repaid_at', 'is_archived', 'archived_at'];
BEGIN
    -- Only prevent changes when status is 'Validated' (immutable state)
    IF OLD.status = 'Validated' AND OLD.data_hash IS NOT NULL THEN
        FOR col_name IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'loan_applications'
              AND column_name != ALL(excluded_columns)
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', col_name, col_name)
            INTO old_val, new_val
            USING OLD, NEW;

            IF old_val IS DISTINCT FROM new_val THEN
                RAISE EXCEPTION 'Data aplikasi anda saat ini sedang di proses LJK pemberi pinjaman sehingga tidak dapat diubah lagi. Kolom "%" tidak dapat diubah.', col_name;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION prevent_immutable_loan_update() IS 'Prevents modification of loan applications that have been validated (status = Validated with data_hash set). Excludes updated_at, data_hash, status, bank_approved_at, repaid_at, is_archived, archived_at.';


