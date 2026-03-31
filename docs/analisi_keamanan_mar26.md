# Laporan Analisis Keamanan & Penetration Testing Terdokumentasi
**Target:** Aplikasi Web Finansial Lendana (Frontend Vite & Backend Supabase)
**Tanggal:** 18 Maret 2026

---

## 1. Ringkasan Eksekutif (Executive Summary)
Pelaksanaan *Penetration Testing* (Whitebox & Analisis Konfigurasi) telah dilakukan terhadap arsitektur aplikasi Lendana. Hasil audit keamanan menunjukkan adanya kerentanan tingkat **KRITIKAL (Critical)** pada lapisan arsitektur basis data dan pengelolaan kredensial API. 

Kerentanan ini memungkinkan penyerang eksternal tanpa hak akses (Unauthenticated Attacker) maupun peretas dengan hak akses rendah (Low-Privilege User) untuk mengambil alih penuh sistem basis data, memanipulasi data finansial nasabah, serta menyetujui pinjaman KUR secara sepihak. Segera lakukan remediasi pada lapisan keamanan *Backend* (Supabase) dan variabel lingkungan (*Environment Variables*).

---

## 2. Profil Risiko (Risk Profile Rating)

| ID | Temuan Kerentanan (Vulnerability) | Tingkat Risiko (Severity) | Kategori OWASP Top 10 |
| :--- | :--- | :--- | :--- |
| **VULN-01** | Kebocoran Kredensial *Service Role Key* Supabase ke Publik | **CRITICAL** (10.0) | *A02:2021 – Cryptographic Failures* |
| **VULN-02** | *Row Level Security* (RLS) Dinonaktifkan secara Global | **CRITICAL** (9.8) | *A01:2021 – Broken Access Control* |
| **VULN-03** | Manipulasi Logika Bisnis Pinjaman via API Klien | **HIGH** (8.5) | *A04:2021 – Insecure Design* |
| **VULN-04** | Komponen NPM (Dependensi Node) Rentan | **MEDIUM** (5.3) | *A06:2021 – Vulnerable and Outdated Components* |

---

## 3. Detail Temuan Teknis (Technical Findings & PoC)

### VULN-01: Kebocoran Kredensial *Service Role Key* Supabase
**Deskripsi:** 
Sistem mengekspos kunci rahasia tertinggi Supabase (*Service Role Key*) pada file `.env` menggunakan prefix `VITE_` (`VITE_SUPABASE_SERVICE_ROLE_KEY`). Karena kerangka kerja Vite secara otomatis mem-bundle semua variabel `VITE_` ke dalam kode JavaScript klien, kunci rahasia ini dapat diakses oleh siapa saja yang membuka DevTools pada peramban web mereka.
*Service Role Key* memiliki hak akses *bypass* absolut terhadap seluruh regulasi keamanan (*Row Level Security*) di PostgreSQL.

**Dampak Potensial (Impact):**
*   Pengambilalihan total (Takeover) basis data PostgreSQL Lendana.
*   Pencurian masif (*Data Breach*) dokumen KYC (KTP, KK) dan data PII (*Personally Identifiable Information*) pekerja migran.
*   Penghapusan paksa tabel pengguna atau ember penyimpanan (*Storage Buckets*).

**Rekomendasi Perbaikan (Remediation):**
1. **Segera** cabut (*Revoke/Roll*) JWT *Service Role Key* saat ini dari Dasbor Supabase Anda.
2. Hapus `VITE_SUPABASE_SERVICE_ROLE_KEY` dari *Frontend*. *Frontend* hanya boleh berinteraksi menggunakan `VITE_SUPABASE_ANON_KEY`.

---

### VULN-02: *Row Level Security* (RLS) Dinonaktifkan secara Global
**Deskripsi:** 
Hasil audit pada skema `public` PostgreSQL menunjukkan bahwa kontrol akses *Row Level Security* (RLS) dalam status `false` untuk hampir seluruh tabel krusial seperti `users`, `loan_applications`, `insurance_companies`, dan `collector_assignments`. Tanpa RLS, Supabase PostgREST API gagal menerapkan pemfilteran data.

**Bukti Konsep (PoC):**
*   Penyerang dapat mengirim modifikasi HTTP `PATCH /rest/v1/users?id=eq.<TARGET_ID>` menggunakan *ANON key* biasa untuk merubah parameter `role` mereka sendiri dari `user` menjadi `admin`, sehingga memicu eskalasi hak istimewa secara horizontal maupun vertikal.

**Dampak Potensial (Impact):**
Eskalasi hak istimewa (Privilege Escalation) dan manipulasi data langsung (IDOR), di mana pengguna A dapat melihat dan menghapus pengajuan pinjaman pengguna B.

**Rekomendasi Perbaikan (Remediation):**
1. Eksekusi perintah `ALTER TABLE <nama_tabel> ENABLE ROW LEVEL SECURITY;` pada seluruh tabel.
2. Definisikan kebijakan *Policy* yang merestriksi operasi `SELECT`, `UPDATE`, dan `DELETE` hanya jika klaim otentikasi JWT sama dengan pemilik baris (`auth.uid() = user_id`).

---

### VULN-03: Manipulasi Logika Bisnis & Nominal Pinjaman
**Deskripsi:** 
Verifikasi finansial diandalkan seutuhnya pada antarmuka *Frontend* (Client-Side). Sistem mengizinkan insersi data sensitif seperti `loan_amount`, `tenor_months`, dan bahkan `status` pinjaman secara langsung dari peramban ke basis data menggunakan perintah asinkron `supabase.from('loan_applications').insert()`.

**Dampak Potensial (Impact):**
Penyerang yang menguasai perangkat seperti Burp Suite dapat menangkap proksi permintaan web dan memodifikasi *payload* JSON. Mereka dapat memalsukan persetujuan pinjaman sepihak (mengirimkan `status: "Approved"`) atau mengubah nilai utang mereka menjadi nol (0) sesaat sebelum data direkam.

**Rekomendasi Perbaikan (Remediation):**
1. Jangan merestui mutasi *field* administratif (`status`, `assigned_agent_id`) melalui gerbang API klien terbuka. Setelan awal harus diotorisasi menggunakan instrumen *Database Triggers* menjadi `status = 'Pending'`.
2. Gunakan *Supabase Edge Functions* atau prosedur tersimpan (RPC) yang terisolasi untuk menangani mutasi transaksi dan perhitungan persetujuan (Approval Logic).

---

### VULN-04: Kerentanan Komponen dan Pustaka Ketergantungan (Dependencies)
**Deskripsi:** 
Pemindaian `npm audit` memberikan laporan adanya celah keamanan berisiko tinggi (High Severity) pada rantai pasokan kode (Supply Chain), seperti paket `minimatch` dan rutin kompilasi `rollup`.

**Dampak Potensial (Impact):**
Celah pada alat pembangunan (Build Tools) berisiko mendatangkan eksploitasi serangan pasok rantai saat sistem integrasi berkelanjutan (CI/CD) melakukan kompilasi berkas yang kemudian diinjeksikan secara tersembunyi ke dalam statik web produksi.

**Rekomendasi Perbaikan (Remediation):**
1. Lakukan pembaruan pustaka keamanan dengan menjalankan perintah `npm audit fix` pada direktori proyek lokal.
2. Perbarui versi Node.js dan Vite secara berkala.

---

## 4. Kesimpulan & Penutup
Aplikasi "Lendana Financial Web App" dalam wujud arsitektur saat ini belum memenuhi kualifikasi standar keamanan sistem elektronik, baik berdasarkan standar OWASP Top 10 maupun POJK Manajemen Risiko Teknologi Informasi. Fokus perbaikan wajib diutamakan pada penghapusan *Service Role Key* dari lingkungan sisi-klien (*Client-Side*) dan penerapan gerbang keamanan *Row Level Security* (RLS) pada tabel basis data internal (Supabase). Setelah remediasi tersebut rampung dieksekusi, disarankan agar penetrasi ulang (*Re-Test validation*) diproses kembali.
