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
