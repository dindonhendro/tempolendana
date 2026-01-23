import { supabase } from './src/lib/supabase';

async function test() {
    console.log("Checking table support_tickets...");
    const { data, error } = await supabase.from('support_tickets').select('*').limit(1);
    if (error) {
        console.error("Error fetching support_tickets:", error);
    } else {
        console.log("Success! support_tickets exists.", data);
    }
    process.exit(error ? 1 : 0);
}

test();
