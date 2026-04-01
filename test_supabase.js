import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptdjmsekjzkmmyrxfkgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGptc2VranprbW15cnhma2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzA4NDIsImV4cCI6MjA2NzcwNjg0Mn0.0sJDeFJl5OJV2dpMY8UVRQSxOgUjj0RPUvpkM5i6Pjo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking bank_id and bank_product_id...");
  const { data, error } = await supabase
    .from('loan_applications')
    .select('id, bank_id, bank_product_id')
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Data:", data);
  }
}

checkSchema();
