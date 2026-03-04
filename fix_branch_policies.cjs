const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://103.127.135.216:8000';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

const c = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

async function runSQL(sql, label) {
    const res = await c.rpc('exec_sql', { query: sql }).catch(() => null);
    if (res && res.error) {
        console.log(`[${label}] rpc error, trying direct fetch...`);
    }
    // Use fetch directly to run raw SQL via the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
    });
    const data = await response.text();
    console.log(`[${label}] status: ${response.status}, response: ${data.substring(0, 200)}`);
}

async function main() {
    console.log('Applying RLS fixes for branch_applications and bank_reviews...\n');

    // Test using the postgres endpoint directly
    const pgUrl = `${SUPABASE_URL}/pg/query`;

    const sqlStatements = [
        // Ensure helper functions exist
        {
            label: 'Create has_role function',
            sql: `
        CREATE OR REPLACE FUNCTION public.has_role(target_role text)
        RETURNS boolean AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = target_role
          );
        $$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
      `
        },
        {
            label: 'Create has_any_role function',
            sql: `
        CREATE OR REPLACE FUNCTION public.has_any_role(target_roles text[])
        RETURNS boolean AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = ANY(target_roles)
          );
        $$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
      `
        },
        // branch_applications policies
        {
            label: 'branch_applications - enable RLS',
            sql: `ALTER TABLE public.branch_applications ENABLE ROW LEVEL SECURITY;`
        },
        {
            label: 'branch_applications - drop old policies',
            sql: `
        DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;
        DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
        DROP POLICY IF EXISTS "Validators can manage branch applications" ON public.branch_applications;
        DROP POLICY IF EXISTS "Bank staff can view branch applications" ON public.branch_applications;
      `
        },
        {
            label: 'branch_applications - SELECT policy',
            sql: `
        CREATE POLICY "Branch applications viewable by relevant users" ON public.branch_applications
        FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));
      `
        },
        {
            label: 'branch_applications - ALL admin policy',
            sql: `
        CREATE POLICY "Admins can manage branch applications" ON public.branch_applications
        FOR ALL USING (public.has_role('admin'));
      `
        },
        {
            label: 'branch_applications - INSERT validator policy',
            sql: `
        CREATE POLICY "Validators can insert branch applications" ON public.branch_applications
        FOR INSERT WITH CHECK (public.has_role('validator'));
      `
        },
        // bank_reviews policies
        {
            label: 'bank_reviews - enable RLS',
            sql: `ALTER TABLE public.bank_reviews ENABLE ROW LEVEL SECURITY;`
        },
        {
            label: 'bank_reviews - drop old policies',
            sql: `
        DROP POLICY IF EXISTS "Bank reviews viewable by relevant users" ON public.bank_reviews;
        DROP POLICY IF EXISTS "Bank staff can create reviews" ON public.bank_reviews;
        DROP POLICY IF EXISTS "Admins can manage bank reviews" ON public.bank_reviews;
      `
        },
        {
            label: 'bank_reviews - SELECT policy',
            sql: `
        CREATE POLICY "Bank reviews viewable by relevant users" ON public.bank_reviews
        FOR SELECT USING (public.has_any_role(ARRAY['admin', 'validator', 'bank_staff']));
      `
        },
        {
            label: 'bank_reviews - INSERT policy',
            sql: `
        CREATE POLICY "Bank staff can create reviews" ON public.bank_reviews
        FOR INSERT WITH CHECK (public.has_role('bank_staff'));
      `
        },
        {
            label: 'bank_reviews - ALL admin policy',
            sql: `
        CREATE POLICY "Admins can manage bank reviews" ON public.bank_reviews
        FOR ALL USING (public.has_role('admin'));
      `
        },
    ];

    for (const stmt of sqlStatements) {
        try {
            // Try using the Supabase admin API directly
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                method: 'HEAD',
                headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
            });

            // Try pg endpoint
            const pgResp = await fetch(`${SUPABASE_URL}/pg/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ query: stmt.sql }),
            });

            if (pgResp.ok) {
                const data = await pgResp.json();
                console.log(`✓ [${stmt.label}]`, JSON.stringify(data).substring(0, 100));
            } else {
                const text = await pgResp.text();
                // Try alternative approach via rpc
                console.log(`✗ [${stmt.label}] pg status ${pgResp.status}: ${text.substring(0, 200)}`);
            }
        } catch (e) {
            console.log(`✗ [${stmt.label}] Error: ${e.message}`);
        }
    }
}

main().catch(console.error);
