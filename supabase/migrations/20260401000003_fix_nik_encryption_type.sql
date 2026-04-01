-- Migration file to fix data type for NIK KTP encryption
-- File: supabase/migrations/20260401000003_fix_nik_encryption_type.sql

-- 1. Mengubah tipe kolom nik_ktp_enc menjadi BYTEA jika sebelumnya VARCHAR/TEXT
ALTER TABLE loan_applications 
ALTER COLUMN nik_ktp_enc TYPE BYTEA 
USING nik_ktp_enc::bytea;

-- 2. Memperbarui fungsi get_decrypted_nik untuk melakukan eksplisit cast (apabila diperlukan versi pg_crypto tertentu)
CREATE OR REPLACE FUNCTION get_decrypted_nik(p_loan_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- Menerjemahkan bytecode kembali menjadi TEXT
  -- Melakukan cast ::bytea agar terhindar dari error function pgp_sym_decrypt signature
  SELECT pgp_sym_decrypt(nik_ktp_enc::bytea, 'Hw_780378') INTO v_decrypted
  FROM loan_applications 
  WHERE id = p_loan_id;

  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
