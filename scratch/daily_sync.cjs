const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

// ============================================================================
// CONFIGURATION (Adjust these values for your VPS)
// ============================================================================
const SOURCE_SUPABASE_URL = process.env.SOURCE_SUPABASE_URL || 'https://[PROJECT_REF_ASAL].supabase.co';
const SOURCE_SERVICE_ROLE_KEY = process.env.SOURCE_SERVICE_ROLE_KEY || '[SOURCE_SERVICE_ROLE_KEY]';
const TARGET_DB_URL = process.env.TARGET_DB_URL || 'postgresql://postgres:Hw_780378@localhost:5432/postgres'; // local inside VPS

const sync = async () => {
  console.log('============================================================================');
  console.log(`Starting Daily Sync at: ${new Date().toISOString()}`);
  console.log('============================================================================');

  try {
    const supabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SERVICE_ROLE_KEY);
    
    // 1. Fetch list of files in 'backups' bucket
    console.log('Fetching backup files list from source storage...');
    const { data: files, error: listError } = await supabase.storage
      .from('backups')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) throw listError;
    if (!files || files.length === 0) throw new Error('No backup files found in bucket.');

    // Get the newest file
    const newestFile = files[0].name;
    console.log(`Newest backup file found: "${newestFile}"`);

    // 2. Download the backup file content
    console.log(`Downloading file: ${newestFile}...`);
    const { data: blob, error: downloadError } = await supabase.storage
      .from('backups')
      .download(newestFile);
    
    if (downloadError) throw downloadError;

    const backupText = await blob.text();
    const backupContent = JSON.parse(backupText);
    const databaseData = backupContent.database;
    
    if (!databaseData) throw new Error('Invalid backup payload format (missing "database" field).');

    // 3. Connect to local target database
    console.log('Connecting to target database...');
    const client = new Client({ connectionString: TARGET_DB_URL });
    await client.connect();
    console.log('Connected successfully to target database.');

    try {
      // Disable constraints and triggers
      console.log('Disabling triggers and foreign keys temporarily...');
      await client.query("SET session_replication_role = 'replica';");
      
      // Dynamic constraint updates to match production data discrepancies
      await client.query("ALTER TABLE public.collector_assignments DROP CONSTRAINT IF EXISTS collector_assignments_status_check;");
      await client.query("ALTER TABLE public.collector_assignments ADD CONSTRAINT collector_assignments_status_check CHECK (status IN ('Assigned', 'Active', 'Completed', 'Cancelled'));");
      await client.query("ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_status_check;");
      await client.query("ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_status_check CHECK (status IN ('Submitted', 'Under Review', 'Checked', 'Validated', 'Bank Approved', 'Bank Rejected', 'Rejected', 'Insured', 'Insurance Assigned', 'Disbursed', 'Active', 'Overdue', 'Completed'));");

      const tableNames = Object.keys(databaseData);
      for (const tableName of tableNames) {
        const rows = databaseData[tableName];
        if (rows.error) {
          console.warn(`[Warning] Skipping table public."${tableName}" due to backup error: ${rows.error}`);
          continue;
        }
        if (!Array.isArray(rows) || rows.length === 0) {
          console.log(`Table public."${tableName}" has no data. Skipping.`);
          continue;
        }

        // Resolve duplicate transaction_id values for loan_applications
        if (tableName === 'loan_applications') {
          const seenTransactionIds = new Set();
          rows.forEach(row => {
            if (row.transaction_id) {
              let tid = row.transaction_id;
              let suffix = 2;
              while (seenTransactionIds.has(tid)) {
                tid = `${row.transaction_id}_${suffix++}`;
              }
              row.transaction_id = tid;
              seenTransactionIds.add(tid);
            }
          });
        }

        console.log(`Restoring ${rows.length} rows to public."${tableName}"...`);
        await client.query(`TRUNCATE TABLE public."${tableName}" CASCADE;`);

        // Bulk insert in chunks of 100 rows
        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const columns = Object.keys(chunk[0]);
          const keys = columns.map(c => `"${c}"`).join(', ');
          
          const valuePlaceholders = [];
          const flatValues = [];
          let placeholderCounter = 1;

          chunk.forEach(row => {
            const rowPlaceholders = columns.map(col => {
              let val = row[col];
              if (val !== null && typeof val === 'object') {
                val = JSON.stringify(val);
              }
              flatValues.push(val);
              return `$${placeholderCounter++}`;
            });
            valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
          });

          const queryText = `INSERT INTO public."${tableName}" (${keys}) VALUES ${valuePlaceholders.join(', ')}`;
          await client.query(queryText, flatValues);
        }
      }
      
      console.log('============================================================================');
      console.log('SUCCESS: Database synchronization completed successfully!');
      console.log('============================================================================');
    } catch (dbErr) {
      console.error('Error during database queries:', dbErr);
    } finally {
      // Re-enable constraints and triggers
      console.log('Re-enabling triggers and foreign keys...');
      await client.query("SET session_replication_role = 'origin';");
      await client.end();
      console.log('Database connection closed.');
    }
  } catch (err) {
    console.error('SYNC CRITICAL ERROR:', err.message || err);
  }
};

sync();
