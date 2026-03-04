const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

async function runSQL(sql) {
    const resp = await fetch('http://103.127.135.216:8000/pg/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE,
            'Authorization': 'Bearer ' + SERVICE,
        },
        body: JSON.stringify({ query: sql }),
    });
    return resp.json();
}

async function main() {
    const fixSafeUUIDPolicy = `
    DROP POLICY IF EXISTS "Agents can view assigned applications" ON public.loan_applications;
    
    CREATE POLICY "Agents can view assigned applications" ON public.loan_applications
    FOR SELECT USING (
      public.has_role('admin') OR
      (
        public.has_any_role(ARRAY['agent', 'checker_agent']) AND
        assigned_agent_id = NULLIF(auth.jwt()->'user_metadata'->>'company_id', '')::uuid
      )
    );

    NOTIFY pgrst, 'reload schema';
  `;

    const fixResult = await runSQL(fixSafeUUIDPolicy);
    console.log('Fixed Agent view policy:', JSON.stringify(fixResult));
}

main().catch(e => console.log('Error:', e.message));
