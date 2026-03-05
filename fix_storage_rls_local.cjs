const fs = require('fs');

const dotenvLines = fs.readFileSync('.env', 'utf8').split('\n');
const SERVICE_LINE = dotenvLines.find(l => l.trim().startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY='));
const SERVICE = SERVICE_LINE ? SERVICE_LINE.split('=')[1].trim() : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const URL_LINE = dotenvLines.find(l => /^VITE_SUPABASE_URL=/.test(l.trim()));
const URL = URL_LINE ? URL_LINE.split('=')[1].trim() : 'http://103.127.135.216:8000';

async function fixStorageRLS() {
    if (!SERVICE) { console.error("No service key found"); return; }
    console.log("Using Supabase URL:", URL);

    const sql = `
        -- Comprehensive fix for documents bucket RLS
        
        -- 1. Ensure the bucket exists
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('documents', 'documents', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
        ON CONFLICT (id) DO UPDATE SET 
            public = true, 
            file_size_limit = 5242880, 
            allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

        -- 2. Enable RLS on storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- 3. Drop all existing policies for the documents bucket to avoid conflicts
        DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
        DROP POLICY IF EXISTS "Public Access" ON storage.objects;
        DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
        DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
        DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
        DROP POLICY IF EXISTS "Allow public access to documents" ON storage.objects;
        DROP POLICY IF EXISTS "Allow users to update own documents" ON storage.objects;
        DROP POLICY IF EXISTS "Allow users to delete own documents" ON storage.objects;
        DROP POLICY IF EXISTS "Debug: Allow all inserts to documents" ON storage.objects;

        -- 4. Create fresh, correct policies
        -- Allow authenticated users to upload to documents bucket
        -- (Strict folder checking to ensure users only upload to their own folder)
        CREATE POLICY "Allow authenticated users to upload documents"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'documents' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );

        -- Allow public access to view documents (since the bucket is public)
        CREATE POLICY "Allow public access to documents"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'documents');

        -- Allow users to update their own files
        CREATE POLICY "Allow users to update own documents"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
          bucket_id = 'documents' AND
          (storage.foldername(name))[1] = auth.uid()::text
        )
        WITH CHECK (
          bucket_id = 'documents' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );

        -- Allow users to delete their own files
        CREATE POLICY "Allow users to delete own documents"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'documents' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
        
        -- Grant necessary permissions
        GRANT ALL ON TABLE storage.objects TO authenticated;
        GRANT ALL ON TABLE storage.buckets TO authenticated;
        GRANT ALL ON TABLE storage.objects TO postgres;
        GRANT ALL ON TABLE storage.buckets TO postgres;
    `;

    try {
        const resp = await fetch(`${URL}/pg/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE,
                'Authorization': 'Bearer ' + SERVICE
            },
            body: JSON.stringify({ query: sql }),
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Fix failed:", errorText);
            return;
        }

        console.log("Storage RLS Policies fixed on local instance.");
    } catch (err) {
        console.error("Fetch error:", err.message);
    }
}

fixStorageRLS().catch(console.error);
