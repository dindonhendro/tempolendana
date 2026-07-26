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
