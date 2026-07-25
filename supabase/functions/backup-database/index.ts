import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Starting backup-database Edge Function...");
    
    // 1. Initialize Supabase Client with client's credentials (to verify token)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // 2. Authenticate the user and check their role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userRole = user.user_metadata?.role || 'user';
    console.log(`Userauthenticated successfully. Email: ${user.email}, Role: ${userRole}`);

    if (userRole !== 'admin') {
      console.warn(`User ${user.email} with role ${userRole} attempted admin-only backup`);
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Initialize Admin Supabase Client using Service Role Key (to bypass RLS)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY env variable is not set on the server");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // List of tables to query for backup
    const tablesToBackup = [
      'users',
      'agent_companies',
      'agent_staff',
      'banks',
      'bank_branches',
      'bank_products',
      'bank_staff',
      'insurance_companies',
      'insurance_staff',
      'insurance_assignments',
      'collector_companies',
      'collector_staff',
      'collector_assignments',
      'support_tickets',
      'audit_logs',
      'consent_logs',
      'loan_applications'
    ];

    console.log(`Querying ${tablesToBackup.length} database tables...`);
    const backupData: Record<string, any> = {};

    // Query all tables in parallel
    const queryPromises = tablesToBackup.map(async (tableName) => {
      try {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*');
        
        if (error) {
          console.warn(`Warning: Could not fetch table ${tableName}:`, error.message);
          backupData[tableName] = { error: error.message };
        } else {
          backupData[tableName] = data || [];
        }
      } catch (err: any) {
        console.error(`Exception querying table ${tableName}:`, err.message || err);
        backupData[tableName] = { error: err.message || String(err) };
      }
    });

    await Promise.all(queryPromises);

    // 4. Assemble the backup JSON payload
    const payload = JSON.stringify({
      backup_version: "1.0",
      timestamp: new Date().toISOString(),
      triggered_by: user.email,
      database: backupData
    }, null, 2);

    // 5. Upload the backup file to the private 'backups' bucket
    const timestampString = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `db_backup_lendana_${timestampString}.json`;

    console.log(`Uploading backup payload (${payload.length} bytes) to storage bucket 'backups' as ${fileName}...`);
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('backups')
      .upload(fileName, new Blob([payload], { type: 'application/json' }), {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    console.log(`Backup completed and saved successfully: ${fileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database backup completed and saved successfully.',
        fileName,
        bucket: 'backups',
        size_bytes: payload.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error("Internal server error during backup:", err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
