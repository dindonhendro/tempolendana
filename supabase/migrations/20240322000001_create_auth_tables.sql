CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'validator', 'bank_staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bank_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bank_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  min_amount BIGINT NOT NULL,
  max_amount BIGINT NOT NULL,
  min_tenor INTEGER NOT NULL,
  max_tenor INTEGER NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bank_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.bank_branches(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
  nama_ibu_kandung TEXT,
  nama_pasangan TEXT,
  ktp_pasangan TEXT,
  telp_pasangan TEXT,
  alamat_pasangan TEXT,
  institution TEXT,
  major TEXT,
  work_experience TEXT,
  work_location TEXT,
  nama_pemberi_kerja TEXT,
  telp_pemberi_kerja TEXT,
  alamat_pemberi_kerja TEXT,
  tanggal_keberangkatan DATE,
  loan_amount BIGINT,
  tenor_months INTEGER,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Checked', 'Validated', 'Bank Approved', 'Bank Rejected', 'Rejected')),
  submission_type TEXT DEFAULT 'PMI',
  validated_by_lendana UUID REFERENCES public.users(id),
  validated_by_lendana_at TIMESTAMP WITH TIME ZONE,
  bank_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.branch_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.bank_branches(id) ON DELETE CASCADE,
  bank_product_id UUID REFERENCES public.bank_products(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.agent_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.agent_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_company_id UUID REFERENCES public.agent_companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable realtime for tables (only if not already added)
DO $$
BEGIN
    -- Add tables to realtime publication if they don't already exist
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
END $$;