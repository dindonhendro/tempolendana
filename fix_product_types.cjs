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
    // Update the type constraint to include both sets of values
    const fixSQL = `
    ALTER TABLE public.bank_products 
    DROP CONSTRAINT IF EXISTS bank_products_type_check;
    
    ALTER TABLE public.bank_products
    ADD CONSTRAINT bank_products_type_check 
    CHECK (type = ANY(ARRAY[
      'PMI'::text, 'Livestock'::text, 'Farmers'::text, 'SME'::text, 'Housing'::text,
      'KUR'::text, 'Personal Loan'::text, 'Business Loan'::text, 'Mortgage'::text
    ]));
    
    NOTIFY pgrst, 'reload schema';
  `;

    const result = await runSQL(fixSQL);
    console.log('Constraint fix result:', JSON.stringify(result));

    // Verify
    const checkSQL = `
    SELECT pg_get_constraintdef(con.oid) as constraint_def
    FROM pg_constraint con
    JOIN pg_class cl ON con.conrelid = cl.oid
    WHERE cl.relname = 'bank_products' AND con.contype = 'c'
  `;
    const checks = await runSQL(checkSQL);
    console.log('\nUpdated constraints:', JSON.stringify(checks, null, 2));

    // Test insert product with KUR type
    const { createClient } = require('@supabase/supabase-js');
    const c = createClient('http://103.127.135.216:8000', SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

    const productTest = await c.from('bank_products').insert([{
        bank_id: 'eb075e4f-98eb-4b91-b18c-08da703adac8',
        name: 'Test KUR Product',
        type: 'KUR',
        interest_rate: 6.5,
        min_amount: 5000000,
        max_amount: 50000000,
        min_tenor: 12,
        max_tenor: 60,
    }]).select();

    if (productTest.error) {
        console.log('\nProduct insert ERROR:', productTest.error.message);
    } else {
        console.log('\nProduct insert OK:', JSON.stringify(productTest.data[0]));
        await c.from('bank_products').delete().eq('id', productTest.data[0].id);
        console.log('Cleaned up');
    }
}

main().catch(e => console.log('Error:', e.message));
