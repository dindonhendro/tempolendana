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
    await runSQL(`
    ALTER TABLE public.loan_applications
    ADD COLUMN IF NOT EXISTS bank_id UUID REFERENCES public.banks(id),
    ADD COLUMN IF NOT EXISTS bank_product_id UUID REFERENCES public.bank_products(id),
    ADD COLUMN IF NOT EXISTS bank_branch_id UUID REFERENCES public.bank_branches(id);
    
    NOTIFY pgrst, 'reload schema';
  `);
    console.log('Columns added successfully.');
}

main().catch(console.error);
