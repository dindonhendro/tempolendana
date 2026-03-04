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
    const checkLoanPoliciesSQL = `
    SELECT policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'loan_applications'
    ORDER BY cmd, policyname
  `;
    const loanPolicies = await runSQL(checkLoanPoliciesSQL);
    console.log('Loan applications policies:');
    loanPolicies.forEach(p => console.log(`  [${p.cmd}] ${p.policyname}:\n    qual="${p.qual}"\n    with_check="${p.with_check}"\n`));

    // also check if admin policy exists but was somehow missed
}

main().catch(e => console.log('Error:', e.message));
