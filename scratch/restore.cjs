const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Target self-hosted connection string
// Example: postgresql://postgres:your-password@supabase-drc1.lendana.id:5432/postgres
const connectionString = process.argv[2];
const backupFilePath = process.argv[3];

if (!connectionString || !backupFilePath) {
  console.error('Usage: node scratch/restore.cjs "<CONNECTION_STRING>" "<PATH_TO_BACKUP_JSON>"');
  process.exit(1);
}

const run = async () => {
  const absolutePath = path.resolve(backupFilePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: Backup file not found at ${absolutePath}`);
    process.exit(1);
  }

  console.log(`Reading backup file from: ${absolutePath}`);
  let backupContent;
  try {
    backupContent = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse backup JSON file:', e.message);
    process.exit(1);
  }

  const databaseData = backupContent.database;
  if (!databaseData) {
    console.error('Invalid backup file format: missing "database" key');
    process.exit(1);
  }

  let client;
  let connected = false;

  // Try connecting with SSL first (highly recommended for Supabase cloud/self-hosted proxies)
  console.log('Attempting to connect with SSL (rejectUnauthorized: false)...');
  try {
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    console.log('Connected to target database (using SSL).');
    connected = true;
  } catch (sslErr) {
    console.warn(`SSL Connection attempt failed: ${sslErr.message}`);
  }

  // If SSL failed, try connecting without SSL
  if (!connected) {
    console.log('Attempting to connect without SSL...');
    try {
      client = new Client({
        connectionString,
        ssl: false
      });
      await client.connect();
      console.log('Connected to target database (without SSL).');
      connected = true;
    } catch (noSslErr) {
      console.error('Failed to connect to the database without SSL:', noSslErr.message);
    }
  }

  if (!connected) {
    console.error('\nError: Could not establish connection to the database.');
    console.error('If port 5432 is blocked by a firewall, you might need to expose it or run this script from inside the host machine.');
    process.exit(1);
  }

  try {
    // 1. Disable constraints and triggers to avoid Foreign Key violations during restore
    console.log('Disabling triggers and foreign keys temporarily...');
    await client.query("SET session_replication_role = 'replica';");

    // 2. Insert data table by table
    const tableNames = Object.keys(databaseData);
    for (const tableName of tableNames) {
      const rows = databaseData[tableName];
      if (rows.error) {
        console.warn(`Skipping table public.${tableName} because it has error in backup: ${rows.error}`);
        continue;
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        console.log(`Table public.${tableName} has no rows. Skipping.`);
        continue;
      }

      console.log(`Restoring ${rows.length} rows to table public.${tableName}...`);

      // Clear existing table data
      await client.query(`TRUNCATE TABLE public.${tableName} CASCADE;`);

      // Bulk insert in chunks of 100 rows
      const chunkSize = 100;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        
        // Build insert query
        const columns = Object.keys(chunk[0]);
        const keys = columns.map(c => `"${c}"`).join(', '); // Wrap column names in quotes to avoid syntax errors with reserved keywords
        
        const valuePlaceholders = [];
        const flatValues = [];
        let placeholderCounter = 1;

        chunk.forEach(row => {
          const rowPlaceholders = columns.map(col => {
            let val = row[col];
            // Format arrays and objects to JSON strings so they insert correctly in JSON/JSONB and array columns
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

    console.log('Restore data completed successfully!');
  } catch (err) {
    console.error('Error during restoration:', err);
  } finally {
    // 3. Re-enable constraints and triggers
    console.log('Re-enabling triggers and foreign keys...');
    try {
      await client.query("SET session_replication_role = 'origin';");
    } catch (e) {
      console.error('Failed to re-enable triggers:', e.message);
    }
    await client.end();
    console.log('Database connection closed.');
  }
};

run();
