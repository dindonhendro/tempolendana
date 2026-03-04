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
    console.log('=== Fixing branch_applications INSERT policy for agent role ===\n');

    // Show current policies first
    const currentPoliciesSQL = `
    SELECT policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'branch_applications'
    ORDER BY policyname
  `;
    const current = await runSQL(currentPoliciesSQL);
    console.log('Current branch_applications policies:');
    current.forEach(p => console.log(`  [${p.cmd}] ${p.policyname}: qual="${p.qual}", with_check="${p.with_check}"`));

    // The problem: agent role needs INSERT permission on branch_applications
    // Agent assigns loan applications to bank branches  
    const fixSQL = `
    -- Drop old restrictive policies
    DROP POLICY IF EXISTS "Staff can manage branch applications" ON public.branch_applications;
    DROP POLICY IF EXISTS "Validators can insert branch applications" ON public.branch_applications;
    DROP POLICY IF EXISTS "Admins can manage branch applications" ON public.branch_applications;
    DROP POLICY IF EXISTS "Branch applications viewable by relevant users" ON public.branch_applications;

    -- New: SELECT - admin, validator, agent, bank_staff can all read
    CREATE POLICY "branch_applications SELECT policy" ON public.branch_applications
    FOR SELECT USING (
      public.has_any_role(ARRAY['admin', 'validator', 'agent', 'checker_agent', 'bank_staff'])
    );

    -- New: INSERT - agents and admins/validators can create assignments
    CREATE POLICY "branch_applications INSERT policy" ON public.branch_applications
    FOR INSERT WITH CHECK (
      public.has_any_role(ARRAY['admin', 'validator', 'agent', 'checker_agent'])
    );

    -- New: UPDATE - admin and validator only
    CREATE POLICY "branch_applications UPDATE policy" ON public.branch_applications
    FOR UPDATE USING (
      public.has_any_role(ARRAY['admin', 'validator'])
    );

    -- New: DELETE - admin only
    CREATE POLICY "branch_applications DELETE policy" ON public.branch_applications
    FOR DELETE USING (
      public.has_role('admin')
    );

    -- Reload PostgREST cache
    NOTIFY pgrst, 'reload schema';
  `;

    const result = await runSQL(fixSQL);
    console.log('\nFix result:', JSON.stringify(result));

    // Verify updated policies
    const updated = await runSQL(currentPoliciesSQL);
    console.log('\nUpdated branch_applications policies:');
    updated.forEach(p => console.log(`  [${p.cmd}] ${p.policyname}`));

    // Also fix loan_applications UPDATE for agents
    // Agents need to update status to 'Checked'
    const checkLoanPoliciesSQL = `
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'loan_applications'
    AND policyname LIKE '%agent%'
    ORDER BY policyname
  `;
    const loanPolicies = await runSQL(checkLoanPoliciesSQL);
    console.log('\nLoan applications agent policies:');
    loanPolicies.forEach(p => console.log(`  [${p.cmd}] ${p.policyname}: qual="${p.qual}"`));

    // Check if agents can update loan_applications status
    const agentUpdatePolicySQL = `
    SELECT COUNT(*) as cnt FROM pg_policies 
    WHERE tablename = 'loan_applications' 
    AND cmd IN ('UPDATE', 'ALL')
    AND (qual LIKE '%agent%' OR roles::text LIKE '%agent%')
  `;
    const agentUpdate = await runSQL(agentUpdatePolicySQL);
    console.log('\nAgent UPDATE policies on loan_applications:', JSON.stringify(agentUpdate));

    // Add agent UPDATE policy for loan_applications if missing  
    const addAgentUpdateSQL = `
    DROP POLICY IF EXISTS "Agents can update assigned applications status" ON public.loan_applications;
    CREATE POLICY "Agents can update assigned applications status" ON public.loan_applications
    FOR UPDATE USING (
      public.has_any_role(ARRAY['agent', 'checker_agent']) AND
      EXISTS (
        SELECT 1 FROM public.agent_staff ast 
        WHERE ast.user_id = auth.uid() 
        AND ast.agent_company_id = loan_applications.assigned_agent_id
      )
    )
    WITH CHECK (
      public.has_any_role(ARRAY['agent', 'checker_agent']) AND
      EXISTS (
        SELECT 1 FROM public.agent_staff ast 
        WHERE ast.user_id = auth.uid() 
        AND ast.agent_company_id = loan_applications.assigned_agent_id
      )
    );
    NOTIFY pgrst, 'reload schema';
  `;
    const agentUpdateResult = await runSQL(addAgentUpdateSQL);
    console.log('\nAgent UPDATE policy added:', JSON.stringify(agentUpdateResult));
}

main().catch(e => console.log('Error:', e.message));
