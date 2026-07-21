import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptdjmsekjzkmmyrxfkgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGptc2VranprbW15cnhma2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzA4NDIsImV4cCI6MjA2NzcwNjg0Mn0.0sJDeFJl5OJV2dpMY8UVRQSxOgUjj0RPUvpkM5i6Pjo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      console.log(`Table '${tableName}': Error: ${error.code} - ${error.message}`);
    } else {
      console.log(`Table '${tableName}': EXISTS (Success)`);
    }
  } catch (err) {
    console.log(`Table '${tableName}': Exception: ${err.message}`);
  }
}

async function runProbes() {
  console.log("Probing additional tables...");
  await probeTable('insurance_assignments');
  await probeTable('collector_assignments');
}

runProbes();
