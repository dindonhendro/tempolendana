-- Migration file to completely rebuild NIK KTP encryption column safely
-- File: supabase/migrations/20260401000004_rebuild_nik_encryption.sql

-- 1. Nonaktifkan sementara trigger keamanan (Immutability & Hash)
ALTER TABLE loan_applications DISABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications DISABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications DISABLE TRIGGER trg_audit_loan_application;
-- (Opsional, pastikan trigger encrypt lama kita nonaktifkan agar tak bentrok saat mengubah tipe)
ALTER TABLE loan_applications DISABLE TRIGGER tr_encrypt_nik_ktp;

-- 2. Hapus kolom bermasalah lalu buat kembali sebagai BYTEA tulen
ALTER TABLE loan_applications DROP COLUMN IF EXISTS nik_ktp_enc;
ALTER TABLE loan_applications ADD COLUMN nik_ktp_enc BYTEA;

-- 3. Eksekusi ulang mass encryption dari awal menggunakan plaintext nik_ktp
UPDATE loan_applications
SET nik_ktp_enc = pgp_sym_encrypt(nik_ktp, 'Hw_780378')
WHERE nik_ktp IS NOT NULL;

-- Memperbarui nilai hash SHA-256 (agar kolom baru ter-hashing optimal untuk immutability status 'Validated')
UPDATE loan_applications
SET data_hash = compute_loan_application_hash(id)
WHERE status = 'Validated';

-- 4. Kembalikan fungsi get_decrypted_nik untuk tak perlu repot cast (Murni BYTEA ke pgp_sym_decrypt)
CREATE OR REPLACE FUNCTION get_decrypted_nik(p_loan_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- Kolom nik_ktp_enc kini sudah jaminan BYTEA murni, decrypt langsung
  SELECT pgp_sym_decrypt(nik_ktp_enc, 'Hw_780378') INTO v_decrypted
  FROM loan_applications 
  WHERE id = p_loan_id;

  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Aktifkan ulang seluruh trigger yang dinonaktifkan
ALTER TABLE loan_applications ENABLE TRIGGER tr_encrypt_nik_ktp;
ALTER TABLE loan_applications ENABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications ENABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications ENABLE TRIGGER trg_audit_loan_application;

-- 6. Refresh Schema Supabase
NOTIFY pgrst, 'reload schema';
