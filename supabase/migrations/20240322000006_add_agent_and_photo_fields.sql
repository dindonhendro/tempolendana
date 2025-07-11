ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES agent_companies(id),
ADD COLUMN IF NOT EXISTS ktp_photo_url TEXT,
ADD COLUMN IF NOT EXISTS self_photo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_loan_applications_assigned_agent ON loan_applications(assigned_agent_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'loan_applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE loan_applications;
    END IF;
END $$;