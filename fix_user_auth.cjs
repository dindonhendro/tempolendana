
const { createClient } = require('@supabase/supabase-js');

async function fixUser() {
    const url = 'http://103.127.135.216:8000';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDE2NTEyMDAsImV4cCI6MTg5OTQxNzYwMH0.GZ2PhVcPZX_vUjykPDTj8RpfWHWtx0hpFkEQvTeQwGU';

    const supabase = createClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = 'userx1@lendana.id';
    const uid = 'f2e73cee-3078-47d4-8f97-c97dd22c9ee0';

    console.log(`--- Fixing User: ${email} ---`);

    // 1. Get user details from auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    const targetUser = users.find(u => u.email === email);
    const targetUid = users.find(u => u.id === uid);

    if (targetUser) {
        console.log(`Found target user by email: ${targetUser.id}`);

        // 2. Confirm email
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            targetUser.id,
            { email_confirm: true }
        );

        if (updateError) {
            console.error('Error confirming email:', updateError.message);
        } else {
            console.log('User email confirmed successfully!');
            console.log('User status:', updateData.user.email_confirmed_at);
        }
    } else {
        console.log(`User ${email} NOT FOUND in auth.users.`);
    }

    if (targetUid) {
        console.log(`Found target user by UID: ${targetUid.email}`);
        const { data: updateDataUid, error: updateErrorUid } = await supabase.auth.admin.updateUserById(
            targetUid.id,
            { email_confirm: true }
        );
        if (!updateErrorUid) console.log(`UID ${uid} confirmed.`);
    } else {
        console.log(`UID ${uid} NOT FOUND in auth.users.`);
    }

    // 3. Check public.users
    console.log('\nChecking public.users sync...');
    const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

    if (publicUser && publicUser.length > 0) {
        console.log('Public record EXISTS:', publicUser[0]);
    } else {
        console.log('Public record MISSING. Trigger may have failed or user was not in public.users.');

        // Manual sync if needed
        if (targetUser) {
            console.log('Attempting manual sync to public.users...');
            const { error: insertError } = await supabase
                .from('users')
                .upsert({
                    id: targetUser.id,
                    email: targetUser.email,
                    full_name: targetUser.user_metadata?.full_name || targetUser.email,
                    role: targetUser.user_metadata?.role || 'user'
                });

            if (insertError) {
                console.error('Manual sync error:', insertError.message);
            } else {
                console.log('Manual sync successful!');
            }
        }
    }
}

fixUser();
