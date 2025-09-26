ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE;

CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    random_suffix TEXT;
    new_transaction_id TEXT;
    id_exists BOOLEAN;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    
    LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        new_transaction_id := date_part || random_suffix;
        
        SELECT EXISTS(
            SELECT 1 FROM public.loan_applications 
            WHERE transaction_id = new_transaction_id
        ) INTO id_exists;
        
        IF NOT id_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_transaction_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_id IS NULL THEN
        NEW.transaction_id := generate_transaction_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_transaction_id ON public.loan_applications;
CREATE TRIGGER trigger_set_transaction_id
    BEFORE INSERT ON public.loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_id();

COMMENT ON COLUMN public.loan_applications.transaction_id IS 'Unique transaction ID with format YYMMDDxxxx where x is random number';
COMMENT ON FUNCTION generate_transaction_id() IS 'Generates unique transaction ID with format YYMMDDxxxx';
COMMENT ON FUNCTION set_transaction_id() IS 'Trigger function to auto-generate transaction_id on insert';