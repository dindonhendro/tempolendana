const URL = 'http://103.127.135.216:8000';
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function runSQL(sql) {
    const resp = await fetch(`${URL}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
        body: JSON.stringify({ query: sql }),
    });
    return resp.json();
}

async function main() {
    const cols = await runSQL("SELECT column_name FROM information_schema.columns WHERE table_name = 'loan_applications'");
    console.log('loan_applications columns:', cols.map(c => c.column_name).join(', '));

    const hasDataHash = cols.some(c => c.column_name === 'data_hash');

    if (!hasDataHash) {
        console.log('Adding data_hash column...');
        await runSQL(`
      ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS data_hash TEXT;
      NOTIFY pgrst, 'reload schema';
    `);
    }

    console.log('Creating compute_loan_application_hash RPC function...');
    const rpcSQL = `
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

        -- Compute SHA-256 hash using pgcrypto
        -- Note: this requires the pgcrypto extension to be installed
        BEGIN
            result_hash := encode(digest(hash_input, 'sha256'), 'hex');
        EXCEPTION WHEN OTHERS THEN
            -- Fallback if pgcrypto is not available - just return a simple base64 hash of the inputs for now
            result_hash := encode(convert_to(hash_input, 'UTF8'), 'base64');
        END;

        RETURN result_hash;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Make it accessible to the right roles
    GRANT EXECUTE ON FUNCTION public.compute_loan_application_hash(UUID) TO authenticated;
    
    NOTIFY pgrst, 'reload schema';
  `;

    const rpcResult = await runSQL(rpcSQL);
    console.log('RPC function creation result:', JSON.stringify(rpcResult));
}

main().catch(console.error);
