
const { createClient } = require('@supabase/supabase-js');

async function listAll() {
    const url = 'http://103.127.135.216:8000';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

    const supabase = createClient(url, serviceRoleKey);

    console.log('--- Listing Loan Applications ---');
    const { data: loans, error: loanError } = await supabase.from('loan_applications').select('*');
    if (loanError) console.error('Loan Error:', loanError.message);
    else console.log(`Loans count: ${loans.length}`, loans);

    console.log('\n--- Listing All Auth Users ---');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error('Auth Error:', authError.message);
    else users.forEach(u => console.log(`- ${u.email} (${u.id}) [Confirmed: ${u.email_confirmed_at}]`));
}

listAll();
