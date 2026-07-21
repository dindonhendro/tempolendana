# Panduan Pembersihan Data Testing (Test Data Cleaning Guide)
## Peran: Administrator (Admin) - Lendana Financial Access Platform

## 📋 Ringkasan Eksekutif

Selama fase pengembangan dan pengujian sistem Lendana, database sering kali terisi oleh banyak data uji (*testing/dummy data*) seperti akun pengguna palsu, aplikasi pinjaman tiruan, dan berkas identitas contoh. Untuk menjaga kebersihan database dan performa sistem, data ini perlu dibersihkan secara berkala oleh **Administrator**.

Namun, karena Lendana menerapkan relasi database dan keamanan yang terstruktur, penghapusan data secara langsung (*naive delete*) akan diblokir oleh sistem karena adanya **Ketergantungan Foreign Key (Kunci Tamu)** tanpa opsi cascade (misal rujukan riwayat audit atau penugasan) yang akan menyebabkan error *Foreign Key Constraint Violation*.

Panduan ini menjelaskan prosedur aman dan menyediakan SQL script siap pakai untuk melakukan pembersihan data secara selektif maupun massal tanpa merusak struktur database.

---

## 🛠️ Analisis Ketergantungan Data (Data Dependency Matrix)

Sebelum melakukan penghapusan, berikut adalah gambaran relasi tabel yang terpengaruh ketika akun pengguna (`auth.users`) dihapus:

### A. Tabel dengan Cascade Delete (Otomatis Terhapus)
Tabel-tabel berikut dikonfigurasi dengan `ON DELETE CASCADE` sehingga datanya akan otomatis terhapus saat user terkait dihapus dari `auth.users`:
* `public.users` (Profil user)
* `public.loan_applications` (Aplikasi pinjaman milik user)
* `public.komponen_biaya` (Rincian biaya pinjaman)
* `public.bank_staff` / `public.agent_staff` / `public.insurance_staff` / `public.collector_staff` (Staf LJK/Agen)
* `public.user_registration_logs` (Log registrasi)
* `public.user_consent_logs` (Log persetujuan privasi)
* `public.branch_applications` & `public.bank_reviews` (Tinjauan bank terkait aplikasi)

### B. Tabel yang Memblokir Penghapusan (Menyebabkan Error)
Tabel-tabel ini merujuk ke `auth.users` atau `public.users` menggunakan relasi biasa (`RESTRICT` / `NO ACTION`). Anda harus mengosongkan (*set NULL*) atau menangani kolom rujukan ini terlebih dahulu sebelum menghapus user:

1. **`public.loan_applications_audit`** (`changed_by` merujuk ke `auth.users`)
2. **`public.loan_applications`** (`validated_by_lendana` merujuk ke `public.users`)
3. **`public.insurance_assignments`** (`assigned_by` merujuk ke `public.users`)
4. **`public.collector_assignments`** (`assigned_by` merujuk ke `auth.users`)

---

## 📝 Langkah-Langkah Pembersihan Data Testing (Prosedur SQL)

Prosedur pembersihan bulk data paling aman dilakukan melalui **SQL Editor** pada Supabase Dashboard dengan hak akses superuser/admin.

### Langkah 1: Buka Supabase Dashboard & Masuk ke SQL Editor
1. Buka browser dan login ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih proyek database **Tempolendana** Anda.
3. Klik menu **SQL Editor** (ikon berbentuk terminal dengan teks `SQL` di panel sebelah kiri).
4. Klik **New Query** untuk membuka lembar kerja SQL kosong.

### Langkah 2: Pilih Opsi Script Pembersihan

Pilihlah salah satu dari opsi di bawah ini yang sesuai dengan kebutuhan Anda:

#### OPSI A: Hapus Massal Berdasarkan Pola Email/Nama (Wildcard)
Gunakan script ini jika Anda ingin menghapus semua user testing yang mengandung kata "test", "dummy", dsb. sekaligus:

```sql
-- 1. Set NULL pada foreign key tabel lain agar tidak melanggar integritas data
UPDATE public.loan_applications_audit 
SET changed_by = NULL 
WHERE changed_by IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@test.com' 
       OR email LIKE '%@dummy.com' 
       OR email LIKE '%@example.com' 
       OR email LIKE '%@lendana.test'
       OR raw_user_meta_data->>'full_name' ILIKE '%test%'
       OR raw_user_meta_data->>'full_name' ILIKE '%dummy%'
);

UPDATE public.loan_applications 
SET validated_by_lendana = NULL 
WHERE validated_by_lendana IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@test.com' 
       OR email LIKE '%@dummy.com' 
       OR email LIKE '%@example.com' 
       OR email LIKE '%@lendana.test'
       OR raw_user_meta_data->>'full_name' ILIKE '%test%'
       OR raw_user_meta_data->>'full_name' ILIKE '%dummy%'
);

UPDATE public.insurance_assignments 
SET assigned_by = NULL 
WHERE assigned_by IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@test.com' 
       OR email LIKE '%@dummy.com' 
       OR email LIKE '%@example.com' 
       OR email LIKE '%@lendana.test'
       OR raw_user_meta_data->>'full_name' ILIKE '%test%'
       OR raw_user_meta_data->>'full_name' ILIKE '%dummy%'
);

UPDATE public.collector_assignments 
SET assigned_by = NULL 
WHERE assigned_by IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@test.com' 
       OR email LIKE '%@dummy.com' 
       OR email LIKE '%@example.com' 
       OR email LIKE '%@lendana.test'
       OR raw_user_meta_data->>'full_name' ILIKE '%test%'
       OR raw_user_meta_data->>'full_name' ILIKE '%dummy%'
);

-- 2. Hapus data aplikasi pinjaman yang terkait dengan user testing
DELETE FROM public.loan_applications 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@test.com' 
       OR email LIKE '%@dummy.com' 
       OR email LIKE '%@example.com' 
       OR email LIKE '%@lendana.test'
       OR raw_user_meta_data->>'full_name' ILIKE '%test%'
       OR raw_user_meta_data->>'full_name' ILIKE '%dummy%'
);

-- 3. Hapus user utama dari auth.users (akan men-cascade hapus profil public.users dan staf terkait)
DELETE FROM auth.users 
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@dummy.com' 
   OR email LIKE '%@example.com' 
   OR email LIKE '%@lendana.test'
   OR raw_user_meta_data->>'full_name' ILIKE '%test%'
   OR raw_user_meta_data->>'full_name' ILIKE '%dummy%';
```

---

#### OPSI B: Hapus User Spesifik Berdasarkan Daftar Email
Gunakan script ini jika Anda ingin memilih sendiri daftar email user yang ingin dihapus. Masukkan daftar email di dalam kurung pada bagian `IN (...)`:

```sql
-- 1. Set NULL pada foreign key tabel lain agar tidak melanggar integritas data
UPDATE public.loan_applications_audit 
SET changed_by = NULL 
WHERE changed_by IN (
    SELECT id FROM auth.users 
    WHERE email IN ('user_test_1@example.com', 'budi.test@lendana.id') -- Masukkan email spesifik Anda di sini
);

UPDATE public.loan_applications 
SET validated_by_lendana = NULL 
WHERE validated_by_lendana IN (
    SELECT id FROM auth.users 
    WHERE email IN ('user_test_1@example.com', 'budi.test@lendana.id') -- Masukkan email spesifik Anda di sini
);

UPDATE public.insurance_assignments 
SET assigned_by = NULL 
WHERE assigned_by IN (
    SELECT id FROM auth.users 
    WHERE email IN ('user_test_1@example.com', 'budi.test@lendana.id') -- Masukkan email spesifik Anda di sini
);

UPDATE public.collector_assignments 
SET assigned_by = NULL 
WHERE assigned_by IN (
    SELECT id FROM auth.users 
    WHERE email IN ('user_test_1@example.com', 'budi.test@lendana.id') -- Masukkan email spesifik Anda di sini
);

-- 2. Hapus data aplikasi pinjaman yang terkait dengan user testing
DELETE FROM public.loan_applications 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('user_test_1@example.com', 'budi.test@lendana.id') -- Masukkan email spesifik Anda di sini
);

-- 3. Hapus akun pengguna secara permanen dari auth.users
DELETE FROM auth.users 
WHERE email IN ('user_test_1@example.com', 'budi.test@lendana.id'); -- Masukkan email spesifik Anda di sini
```

---

#### 💡 OPSI C: Contoh Kasus Sukses (Kasus Uji Coba Penghapusan Spesifik)
Berikut adalah contoh script SQL yang telah sukses dijalankan untuk menghapus akun uji coba khusus `userx1@lendana.id` dan `userx2@lendana.id`:

```sql
-- 1. Set NULL pada foreign key tabel lain agar tidak melanggar integritas data
UPDATE public.loan_applications_audit 
SET changed_by = NULL 
WHERE changed_by IN (
    SELECT id FROM auth.users 
    WHERE email IN ('userx1@lendana.id', 'userx2@lendana.id')
);

UPDATE public.loan_applications 
SET validated_by_lendana = NULL 
WHERE validated_by_lendana IN (
    SELECT id FROM auth.users 
    WHERE email IN ('userx1@lendana.id', 'userx2@lendana.id')
);

UPDATE public.insurance_assignments 
SET assigned_by = NULL 
WHERE assigned_by IN (
    SELECT id FROM auth.users 
    WHERE email IN ('userx1@lendana.id', 'userx2@lendana.id')
);

UPDATE public.collector_assignments 
SET assigned_by = NULL 
WHERE assigned_by IN (
    SELECT id FROM auth.users 
    WHERE email IN ('userx1@lendana.id', 'userx2@lendana.id')
);

-- 2. Hapus data aplikasi pinjaman yang terkait dengan user tersebut
DELETE FROM public.loan_applications 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('userx1@lendana.id', 'userx2@lendana.id')
);

-- 3. Hapus akun pengguna secara permanen dari auth.users
DELETE FROM auth.users 
WHERE email IN ('userx1@lendana.id', 'userx2@lendana.id');
```

---

## 📂 Pembersihan Dokumen Fisik di Storage Bucket

Saat aplikasi pinjaman dihapus, dokumen identitas fisik (foto KTP, Selfie, Paspor, dll.) yang diunggah ke Supabase Storage bucket `documents` masih tersimpan di server. Untuk menghapus file-file tersebut:

### Opsi A: Melalui Dashboard Supabase UI
1. Masuk ke **Supabase Dashboard** -> **Storage**.
2. Buka folder/bucket **`documents`**.
3. Di dalam folder tersebut, cari folder dengan nama berupa `user_id` dari user testing yang telah dihapus.
4. Klik ikon titik tiga pada folder tersebut dan pilih **Delete**.

### Opsi B: Menggunakan SQL API untuk Membersihkan Metadata Storage
Supabase melacak objek file pada skema `storage.objects`. Anda dapat menghapus rujukan file dari database agar file tersebut didelete dari cloud storage:

```sql
-- Jalankan query ini untuk menghapus rujukan objek storage milik user testing
DELETE FROM storage.objects 
WHERE bucket_id = 'documents' 
AND (storage.foldername(name))[1] IN (
    -- Ganti dengan list ID user testing yang dihapus
    -- Contoh: 'a3d0b2f1-4db5-48ef-93f4-d500e5728a30'
);
```

---

## 🛡️ Prosedur Keselamatan & Praktik Terbaik (Best Practices)

> [!CAUTION]
> Menghapus data secara langsung di database produksi memiliki risiko tinggi. Ikuti protokol keselamatan di bawah ini tanpa pengecualian.

### 1. Lakukan Backup Database Terlebih Dahulu
Sebelum mengeksekusi skrip pembersihan bulk, buat salinan cadangan (*backup*) database Anda:
* Di Supabase: Buka **Database** -> **Backups** -> Klik **Backup Now** (untuk backup harian/manual).
* Via CLI: Gunakan `pg_dump` untuk mengekspor data:
  ```bash
  pg_dump -h db.your-project.supabase.co -U postgres -d postgres -t public.users -t public.loan_applications > backup_lendana.sql
  ```

### 2. Jalankan Uji Coba di Lingkungan Staging
* Selalu uji coba skrip SQL di atas pada lingkungan **Staging / Development** sebelum diterapkan di server **Production**.

---
*Panduan ini disusun untuk membantu Administrator menjaga integritas data sistem Lendana PMI tetap bersih dan patuh terhadap standar OJK.*
