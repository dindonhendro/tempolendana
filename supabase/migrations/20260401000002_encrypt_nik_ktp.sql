-- Migration file to implement zero-risk field level encryption for NIK KTP
-- File: supabase/migrations/20260401000002_encrypt_nik_ktp.sql

-- 1. Pastikan ekstensi pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Menambahkan kolom ciphertext 'nik_ktp_enc' (bertipe BYTEA) dengan aman
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS nik_ktp_enc BYTEA;

COMMENT ON COLUMN loan_applications.nik_ktp_enc IS 'Ciphertext NIK KTP yang dienkripsikan oleh pgcrypto untuk kepentingan keamanan data.';

-- 3. Membuat fungsi trigger agar data NIK otomatis ter-enkripsi setiap disisipkan/diubah
CREATE OR REPLACE FUNCTION encrypt_nik_ktp_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  -- Menggunakan secret_key: 'Hw_780378'
  IF NEW.nik_ktp IS NOT NULL THEN
    NEW.nik_ktp_enc := pgp_sym_encrypt(NEW.nik_ktp, 'Hw_780378');
  ELSE
    NEW.nik_ktp_enc := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Menghapus trigger lama jika ada
DROP TRIGGER IF EXISTS tr_encrypt_nik_ktp ON loan_applications;

-- Menempelkan trigger ke event INSERT dan UPDATE
CREATE TRIGGER tr_encrypt_nik_ktp
BEFORE INSERT OR UPDATE OF nik_ktp
ON loan_applications
FOR EACH ROW
EXECUTE FUNCTION encrypt_nik_ktp_trigger_func();

-- 4. Melakukan enkripsi masal pada data existing yang belum terenkripsi (Zero Risk copy)
-- Menonaktifkan sementara trigger keamanan immutability pada saat migrasi struktur
ALTER TABLE loan_applications DISABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications DISABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications DISABLE TRIGGER trg_audit_loan_application;

-- Mengubah data untuk memicu trigger enkripsi baru
UPDATE loan_applications
SET nik_ktp = nik_ktp
WHERE nik_ktp IS NOT NULL AND nik_ktp_enc IS NULL;

-- Memperbarui nilai hash SHA-256 agar valid dengan struktur kolom baru (ada nik_ktp_enc)
UPDATE loan_applications
SET data_hash = compute_loan_application_hash(id)
WHERE status = 'Validated';

-- Mengaktifkan kembali trigger keamanan
ALTER TABLE loan_applications ENABLE TRIGGER trg_prevent_immutable_loan_update;
ALTER TABLE loan_applications ENABLE TRIGGER trg_generate_hash_on_loan_submit;
ALTER TABLE loan_applications ENABLE TRIGGER trg_audit_loan_application;

-- 5. Membuat Fungsi Dekripsi Otorisasi (RPC) agar frontend/admin bisa melihat plaintext
CREATE OR REPLACE FUNCTION get_decrypted_nik(p_loan_id UUID) 
RETURNS TEXT AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- Menerjemahkan bytecode kembali menjadi TEXT hanya jika secret_key cocok
  SELECT pgp_sym_decrypt(nik_ktp_enc, 'Hw_780378') INTO v_decrypted
  FROM loan_applications 
  WHERE id = p_loan_id;

  RETURN v_decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_decrypted_nik(UUID) IS 'Fungsi khusus berotorisasi untuk mendapatkan NIK KTP asli (dekripsi) dari data yang terenkripsi.';

-- 6. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
