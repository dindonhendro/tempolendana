const fs = require('fs');
const dotenv = fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = dotenv ? dotenv.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL = 'http://103.127.135.216:8000';

async function modifyPolicies() {
  const sql = `
DO $$
BEGIN
    DROP POLICY IF EXISTS "Bank staff can update loan applications" ON public.loan_applications;
    
    CREATE POLICY "Bank staff can update loan applications" 
    ON public.loan_applications 
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM bank_staff
        WHERE bank_staff.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM bank_staff
        WHERE bank_staff.user_id = auth.uid()
      )
    );
    
    DROP POLICY IF EXISTS "Bank staff can read loan applications" ON public.loan_applications;
    
    CREATE POLICY "Bank staff can read loan applications" 
    ON public.loan_applications 
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM bank_staff
        WHERE bank_staff.user_id = auth.uid()
      )
    );
END
$$;
NOTIFY pgrst, 'reload schema';
  `;

  if (!SERVICE) { console.error("No service key found"); return; }

  const resp = await fetch(`${URL}/pg/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SERVICE, 'Authorization': 'Bearer ' + SERVICE },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.log('Error:', t);
  } else {
    console.log('Policy applied successfully. Status:', resp.status);
  }
}

modifyPolicies().catch(console.error);
