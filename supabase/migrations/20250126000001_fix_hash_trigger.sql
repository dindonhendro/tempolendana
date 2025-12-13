-- ============================================================================
-- FIX: Hash Computation in BEFORE Trigger
-- ============================================================================
-- Problem: compute_loan_application_hash() tries to SELECT from table,
--          but in BEFORE trigger, the row hasn't been updated yet.
-- Solution: Create a new function that computes hash from NEW record directly.
-- ============================================================================

-- ============================================================================
-- SECTION 1: NEW FUNCTION TO COMPUTE HASH FROM RECORD (not from SELECT)
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_hash_from_record(p_record loan_applications)
RETURNS TEXT AS $$
DECLARE
    row_data JSONB;
    canonical_json TEXT;
    hash_val TEXT;
    sorted_keys TEXT[];
    key_val RECORD;
    result_json JSONB := '{}'::JSONB;
BEGIN
    row_data := to_jsonb(p_record) - 'data_hash' - 'updated_at';

    SELECT ARRAY_AGG(key ORDER BY key)
    INTO sorted_keys
    FROM jsonb_object_keys(row_data) AS key;

    FOR key_val IN
        SELECT key, row_data -> key AS value
        FROM unnest(sorted_keys) AS key
    LOOP
        result_json := result_json || jsonb_build_object(key_val.key, key_val.value);
    END LOOP;

    canonical_json := result_json::TEXT;

    hash_val := encode(digest(canonical_json, 'sha256'), 'hex');

    RETURN hash_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION compute_hash_from_record(loan_applications) IS 'Computes SHA-256 hash from a loan_applications record directly (for use in BEFORE triggers)';

-- ============================================================================
-- SECTION 2: UPDATE THE TRIGGER FUNCTION TO USE NEW HASH FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_hash_on_loan_submit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Validated' AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status IS DISTINCT FROM 'Validated') THEN
        IF NEW.data_hash IS NULL THEN
            NEW.data_hash := compute_hash_from_record(NEW);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 3: UPDATE compute_loan_application_hash FOR VERIFICATION (AFTER commit)
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_loan_application_hash(p_loan_application_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_record loan_applications%ROWTYPE;
BEGIN
    SELECT * INTO v_record
    FROM loan_applications
    WHERE id = p_loan_application_id;

    IF v_record.id IS NULL THEN
        RAISE EXCEPTION 'Loan application with id % not found', p_loan_application_id;
    END IF;

    RETURN compute_hash_from_record(v_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: RECREATE TRIGGERS WITH CORRECT ORDER
-- ============================================================================

DROP TRIGGER IF EXISTS trg_generate_hash_on_loan_submit ON loan_applications;
DROP TRIGGER IF EXISTS trg_prevent_immutable_loan_update ON loan_applications;

CREATE TRIGGER trg_generate_hash_on_loan_submit
    BEFORE INSERT OR UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_hash_on_loan_submit();

CREATE TRIGGER trg_prevent_immutable_loan_update
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION prevent_immutable_loan_update();

-- ============================================================================
-- END OF FIX
-- ============================================================================
