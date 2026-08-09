const fs = require('fs');
const path = require('path');

const backupFilePath = path.join(__dirname, '../db_backup.json');
const outputSqlPath = path.join(__dirname, '../restore_data.sql');

const run = () => {
  if (!fs.existsSync(backupFilePath)) {
    console.error(`Error: Backup file 'db_backup.json' not found at ${backupFilePath}`);
    console.error('Please download the backup file from Supabase storage and save it in the root folder as db_backup.json');
    process.exit(1);
  }

  console.log(`Reading backup file: ${backupFilePath}`);
  let backupContent;
  try {
    backupContent = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse backup JSON file:', e.message);
    process.exit(1);
  }

  const databaseData = backupContent.database;
  if (!databaseData) {
    console.error('Invalid backup file format: missing "database" key');
    process.exit(1);
  }

  let sqlOutput = `-- ============================================================================\n`;
  sqlOutput += `-- DATABASE RESTORE SCRIPT (GENERATED FROM JSON BACKUP)\n`;
  sqlOutput += `-- ============================================================================\n\n`;
  
  // 1. Disable constraints and triggers
  sqlOutput += `-- Disable triggers and foreign keys temporarily\n`;
  sqlOutput += `SET session_replication_role = 'replica';\n\n`;

  sqlOutput += `-- Schema adjustments to align check constraints with production data\n`;
  sqlOutput += `ALTER TABLE public.collector_assignments DROP CONSTRAINT IF EXISTS collector_assignments_status_check;\n`;
  sqlOutput += `ALTER TABLE public.collector_assignments ADD CONSTRAINT collector_assignments_status_check CHECK (status IN ('Assigned', 'Active', 'Completed', 'Cancelled'));\n\n`;
  sqlOutput += `ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_status_check;\n`;
  sqlOutput += `ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_status_check CHECK (status IN ('Submitted', 'Under Review', 'Checked', 'Validated', 'Bank Approved', 'Bank Rejected', 'Rejected', 'Insured', 'Insurance Assigned', 'Disbursed', 'Active', 'Overdue', 'Completed'));\n\n`;

  // 2. Loop through tables and generate SQL inserts
  const tableNames = Object.keys(databaseData);
  for (const tableName of tableNames) {
    const rows = databaseData[tableName];
    if (rows.error) {
      sqlOutput += `-- WARNING: Skipping table public."${tableName}" due to backup error: ${rows.error}\n\n`;
      continue;
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      sqlOutput += `-- Table public."${tableName}" has no rows. Skipping.\n\n`;
      continue;
    }

    // Resolve duplicate transaction_id values in loan_applications
    if (tableName === 'loan_applications') {
      const seenTransactionIds = new Set();
      rows.forEach(row => {
        if (row.transaction_id) {
          let tid = row.transaction_id;
          let suffix = 2;
          while (seenTransactionIds.has(tid)) {
            tid = `${row.transaction_id}_${suffix++}`;
          }
          if (tid !== row.transaction_id) {
            console.log(`Resolving duplicate transaction_id: "${row.transaction_id}" -> "${tid}" for application of "${row.full_name}"`);
            row.transaction_id = tid;
          }
          seenTransactionIds.add(tid);
        }
      });
    }

    sqlOutput += `-- ----------------------------------------------------------------------------\n`;
    sqlOutput += `-- Table: public."${tableName}" (${rows.length} rows)\n`;
    sqlOutput += `-- ----------------------------------------------------------------------------\n`;
    sqlOutput += `TRUNCATE TABLE public."${tableName}" CASCADE;\n\n`;
    
    // We stringify the rows and use PostgreSQL dollar-quoting ($json_data$) to avoid single quote escaping issues
    const jsonString = JSON.stringify(rows, null, 2);
    sqlOutput += `INSERT INTO public."${tableName}"\n`;
    sqlOutput += `SELECT * FROM json_populate_recordset(NULL::public."${tableName}", $json_data$\n`;
    sqlOutput += jsonString;
    sqlOutput += `\n$json_data$);\n\n`;
  }

  // 3. Re-enable constraints and triggers
  sqlOutput += `-- Re-enable triggers and foreign keys\n`;
  sqlOutput += `SET session_replication_role = 'origin';\n`;

  fs.writeFileSync(outputSqlPath, sqlOutput, 'utf8');
  console.log(`\nSuccess! Restore SQL script generated at: ${outputSqlPath}`);
  console.log('You can open this file, copy its contents, and run it in the Supabase SQL Editor!');
};

run();
