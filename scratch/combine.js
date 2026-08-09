const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const outputFile = path.join(__dirname, '../combined_migrations.sql');

try {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let combined = '';

  files.forEach(file => {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Wrap only non-indented (raw) ALTER PUBLICATION statements
    content = content.replace(/^alter\s+publication\s+supabase_realtime\s+add\s+table\s+(\w+);/gim, (match, tableName) => {
      console.log(`Wrapping raw ALTER PUBLICATION for table "${tableName}" in file: ${file}`);
      return `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = '${tableName}'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ${tableName};
    END IF;
END $$;`;
    });
    
    combined += `-- ==========================================\n`;
    combined += `-- FILE: ${file}\n`;
    combined += `-- ==========================================\n\n`;
    combined += content + '\n\n';
  });

  fs.writeFileSync(outputFile, combined, 'utf8');
  console.log('Successfully combined and sanitized migrations into combined_migrations.sql!');
} catch (err) {
  console.error('Error combining migrations:', err);
  process.exit(1);
}
