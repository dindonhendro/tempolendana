# Laporan Kebijakan dan Implementasi Keamanan Siber (Cybersecurity)
## Lendana Financial Access Platform
### Pemenuhan Persyaratan Regulasi Otoritas Jasa Keuangan (OJK)

**Penyusun:** PT. Lendana Digitalindo Nusantara  
**Dokumen Referensi:** Kepatuhan Penyelenggara Layanan Agregator Finansial & Keamanan Informasi  
**Tanggal:** 25 Juli 2026  
**Status:** Rahasia (Confidential - OJK Only)  

---

## Daftar Isi
1. [Enkripsi](#1-enkripsi)
2. [Keamanan Penyimpanan Data](#2-keamanan-penyimpanan-data)
3. [Autentikasi dan Kontrol Akses](#3-autentikasi-dan-kontrol-akses)
4. [Integritas Data](#4-integritas-data)
5. [Kebijakan Retensi Data](#5-kebijakan-retensi-data)
6. [Keamanan Pemusnahan Data](#6-keamanan-pemusnahan-data)
7. [Pencadangan (Back-up) dan Pemulihan (Recovery) Data](#7-pencadangan-back-up-dan-pemulihan-recovery-data)
8. [Pusat Data (Data Center)](#8-pusat-data-data-center)
9. [Pusat Pemulihan Bencana (Disaster Recovery Center - DRC)](#9-pusat-pemulihan-bencana-disaster-recovery-center---drc)
10. [Penilaian Risiko (Risk Assessment)](#10-penilaian-risiko-risk-assessment)
11. [Peningkatan Kontrol Keamanan](#11-peningkatan-kontrol-keamanan)
12. [Rencana Tanggap Insiden (Incident Response Plan)](#12-rencana-tanggap-insiden-incident-response-plan)
13. [Langkah dan Perangkat Tindakan Keamanan](#13-langkah-dan-perangkat-tindakan-keamanan)
14. [Pemantauan dan Peninjauan Berkala](#14-pemantauan-dan-peninjauan-berkala)

---

## 1. Enkripsi

Lendana menerapkan enkripsi berlapis baik pada data yang berpindah (*data-in-transit*) maupun data yang disimpan (*data-at-rest*):

*   **Enkripsi Data dalam Perjalanan (Data-in-Transit):**
    *   Menggunakan protokol **HTTPS** dengan sertifikasi **TLS 1.3** untuk seluruh komunikasi data antara aplikasi klien (web/mobile) dan server API Supabase.
    *   Algoritma cipher yang digunakan minimal mendukung AES-128/256-GCM demi mencegah intersepsi di tengah jalan (*Man-in-the-Middle Attack*).
*   **Enkripsi Data dalam Penyimpanan (Data-at-Rest):**
    *   **Enkripsi Database Utama:** Seluruh penyimpanan volume database PostgreSQL pada managed database cloud terenkripsi menggunakan kunci enkripsi bawaan cloud provider (AES-256).
    *   **Enkripsi Kolom Sensitif (pg_sodium):** Untuk kolom identitas sensitif seperti Nomor Induk Kependudukan (NIK KTP), sistem menerapkan kriptografi tingkat tinggi menggunakan library **`pg_sodium`** di tingkat database. Data NIK KTP dienkripsi menggunakan kunci enkripsi khusus (secret key) sebelum dimasukkan ke dalam penyimpanan fisik PostgreSQL sehingga tidak dapat dibaca secara langsung oleh administrator database sekalipun (*non-admin bypass proof*).

---

## 2. Keamanan Penyimpanan Data

Penyimpanan berkas dokumen fisik dan data tabular dalam platform Lendana menerapkan aturan keamanan berlapis:

*   **Row-Level Security (RLS) PostgreSQL:**
    *   Keamanan data terisolasi di tingkat baris (*Row-Level Security*). Pengguna biasa (`user`) hanya diizinkan untuk melihat/mengubah data miliknya sendiri. 
    *   Pihak ketiga (seperti agen, bank, asuransi, collector, CS) hanya dapat mengakses data pinjaman yang didelegasikan secara legal kepada mereka sesuai dengan peran operasionalnya.
*   **Penyimpanan Dokumen (Supabase Storage Buckets):**
    *   Dokumen sensitif (KTP, slip gaji, foto diri, dll.) disimpan di dalam bucket penyimpanan privat (`backups` dan `loan-documents`).
    *   Dokumen di dalam bucket privat tidak dapat diakses langsung via URL publik. Akses berkas hanya dimungkinkan melalui pembuatan *Signed URL* berjangka waktu pendek (maksimal 5 menit) setelah divalidasi oleh otorisasi server.

---

## 3. Autentikasi dan Kontrol Akses

Lendana menerapkan mekanisme autentikasi ketat dan kontrol akses berbasis peran (RBAC - Role Based Access Control) guna membatasi paparan data:

*   **Mekanisme Autentikasi:**
    *   Autentikasi terpusat menggunakan **Supabase Auth** berbasis **JSON Web Tokens (JWT)** yang ditandatangani secara kriptografis oleh server.
    *   Setiap request API ke backend wajib melampirkan header otorisasi Bearer Token JWT yang masih aktif.
*   **Matriks Kontrol Akses (RBAC):**
    *   Hak akses dibagi menjadi peran-peran spesifik (User, Agent, Checker Agent, Validator, Bank Staff, Insurance, Collector, Admin, CS).
    *   Akses administratif dipisahkan secara tegas. Contoh: Customer Service (CS) memiliki dasbor khusus untuk menangani pengaduan dan log keluhan, namun **dilarang keras** melihat data keuangan sensitif atau menyetujui pinjaman.
*   **Manajemen Sesi Inaktif (Inactivity Timeout):**
    *   Sistem secara otomatis mendeteksi ketiadaan aktivitas pengguna (idle). Jika dalam waktu 10 menit berturut-turut tidak ada aktivitas mouse/keyboard/layar sentuh, token sesi akan dihapus dan pengguna secara paksa dikeluarkan dari sistem (*forced log-out*).
    *   Pendeteksi waktu inaktif dipasang pada fase *capture* (`{ capture: true }`) untuk menjamin aktivitas di dalam jendela modal/dialog Radix/Shadcn tetap terekam secara andal dan mencegah bypass deteksi.

---

## 4. Integritas Data

Guna memastikan data pengajuan tidak dimodifikasi secara ilegal oleh pihak internal maupun eksternal pasca-validasi, Lendana mengimplementasikan sistem **Data Immutability (Integritas Data Kriptografis)**:

*   **Fungsi Hash Kriptografi:**
    *   Sistem menghitung nilai checksum dari gabungan kolom sensitif pengajuan pinjaman (NIK, nominal, instansi, dll) menggunakan algoritma **SHA-256** (`compute_loan_application_hash`).
    *   Nilai hash ini disimpan secara permanen pada kolom `data_hash` saat aplikasi disetujui/disubmit.
*   **Trigger Penolak Perubahan (Database-Level Trigger):**
    *   Database mengaktifkan trigger trigger `prevent_immutable_loan_update` pada tabel `loan_applications`.
    *   Begitu status aplikasi berubah menjadi `Validated` (Telah divalidasi oleh Lendana untuk diteruskan ke Bank), sistem database PostgreSQL akan menolak secara mutlak (`raise exception`) setiap transaksi `UPDATE` pada kolom data aplikasi.
    *   Perubahan hanya diizinkan pada kolom operasional tertentu yang memang harus dinamis (seperti tanggal persetujuan bank `bank_approved_at`).

---

## 5. Kebijakan Retensi Data

Lendana menerapkan kebijakan masa simpan data konsumen sesuai regulasi OJK:

*   **Masa Retensi Aktif Pinjaman (Repayment + 3 Bulan):**
    *   Sesuai regulasi OJK, data pengajuan pinjaman tetap dipertahankan dalam kondisi aktif selama **3 (tiga) bulan setelah pinjaman dilunasi secara penuh** (status `'Completed'`).
    *   Tanggal pelunasan pinjaman (`repaid_at`) diinput secara manual oleh Staff Bank Mitra di dasbor `BankStaffDashboard` setelah memverifikasi pelunasan rekening koran.
    *   Selama periode 3 bulan retensi aktif ini, data pinjaman lengkap tetap dapat diakses oleh audit internal, bank, dan OJK. Setelah melewati masa 3 bulan, data pribadi konsumen (PII) akan otomatis disamarkan (anonimisasi) demi keamanan data (UU PDP).
*   **Masa Retensi Pasca-Aktif (Arsip Utama):**
    *   Data finansial (nominal pinjaman, tenor, instansi penyalur) tetap disimpan secara terarsip selama **minimal 5 (lima) tahun** untuk keperluan pelaporan statistik kinerja keuangan ke OJK.
*   **Log Kepatuhan Audit (E-Consent & Audit Trail):**
    *   Log persetujuan konsumen (`user_consent_logs`) untuk dokumen hukum penting (syarat ketentuan dan kebijakan privasi) diarsipkan secara lengkap beserta alamat IP dan *User Agent* peramban demi keperluan pembuktian hukum.

---

## 6. Keamanan Pemusnahan Data

Untuk mendukung hak pengguna untuk dilupakan (*Right to be Forgotten*) serta perlindungan data pribadi (UU PDP):

*   **Pemusnahan Data Mutlak (Cascade Purge):**
    *   Pemusnahan akun pengguna dilakukan menggunakan fungsi RPC database terproteksi `delete_own_user()` yang berjalan di tingkat superuser (`SECURITY DEFINER`).
    *   Penghapusan dimulai dari baris tabel kredensial `auth.users`. Berkat relasi dependensi asing database yang dikonfigurasi dengan aturan **`ON DELETE CASCADE`**, PostgreSQL secara otomatis menghapus seluruh baris data profil (`public.users`), aplikasi pinjaman (`loan_applications`), asuransi, serta berkas log persetujuan (`user_consent_logs`).
*   **Penghapusan File Fisik:**
    *   Sistem menghapus semua berkas dokumen pemohon (foto KTP, foto diri) dari media penyimpanan penyimpanan privat Supabase Storage secara permanen saat akun dimusnahkan.

---

## 7. Pencadangan (Back-up) dan Pemulihan (Recovery) Data

Lendana memiliki mekanisme penanganan pencadangan logis demi keandalan sistem dan pemulihan bencana (*Disaster Recovery*):

*   **Metode Pencadangan Cloud:**
    *   Pencadangan dilakukan secara logis menggunakan Supabase Edge Function (`backup-database`) yang memproses ekspor seluruh 17 tabel inti database ke berkas format JSON terstruktur.
    *   Hasil pencadangan disimpan ke dalam Supabase Storage Bucket privat bernama `backups` yang hanya dapat diakses melalui peran Admin internal.
*   **Prosedur Pemulihan (Recovery Procedure):**
    *   Pemulihan data dilakukan menggunakan script pemulih database Node.js (`restore.cjs`) secara terprogram.
    *   Pemulihan dijalankan secara bertahap mengikuti urutan dependensi tabel PostgreSQL (induk dimasukkan terlebih dahulu sebelum anak, misal: tabel `users` -> `loan_applications` -> `insurance_assignments`) untuk mencegah kesalahan kendala kunci asing (*Foreign Key Constraints*).
    *   Script pemulihan wajib menggunakan operasi **`UPSERT`** (`onConflict: 'id'`) untuk memitigasi risiko data duplikat.

---

## 8. Pusat Data (Data Center)

Pusat data fisik (Data Center) yang melayani platform Lendana dioperasikan dengan standar kepatuhan tinggi:

*   **Lokasi Fisik:**
    *   Layanan hosted database dan server API Supabase di-host pada Infrastruktur **AWS (Amazon Web Services) Region Singapura (ap-southeast-1)**. Hal ini dilakukan demi menjamin latensi rendah untuk pengguna Indonesia dan kepatuhan penuh regulasi penempatan data.
*   **Sertifikasi Kepatuhan Fisik:**
    *   AWS Data Center memegang sertifikasi standar keamanan tertinggi secara global, termasuk **ISO/IEC 27001, SOC 1/2/3, PCI-DSS, dan ISO 27018** untuk perlindungan data pribadi di cloud.

---

## 9. Pusat Pemulihan Bencana (Disaster Recovery Center - DRC)

Guna meminimalkan durasi gangguan (*Downtime*) jika terjadi bencana alam atau kerusakan fatal pada pusat data utama:

*   **Penyimpanan Salinan Backup Lintas Zona (Cross-Zone Redundancy):**
    *   Penyimpanan berkas cadangan data di bucket `backups` secara otomatis direplikasi secara geografis oleh penyedia cloud ke beberapa zona ketersediaan (*Availability Zones*) mandiri yang berbeda.
*   **Prosedur Aktivasi Failover:**
    *   Jika database utama tidak dapat diakses secara total, tim infrastruktur Lendana dapat mengaktifkan replika database sekunder (Read-Replica) di zona geografis terpisah sebagai server database utama yang baru (*promote replica*).

---

## 10. Penilaian Risiko (Risk Assessment)

Lendana melakukan pemetaan dan penilaian risiko keamanan siber secara berkala:

*   **Identifikasi Risiko Utama:**
    *   *Risiko Kebocoran Data Identitas Pelanggan (NIK KTP).* Mitigasi: Enkripsi AES-256 tingkat kolom via pg_sodium.
    *   *Risiko Manipulasi Status Validasi Kredit.* Mitigasi: Tanda tangan kriptografis (SHA-256 hash) dan trigger database read-only.
    *   *Risiko Akses Ilegal via Token Kedaluwarsa.* Mitigasi: Penerapan inactivity timeout (10 menit) yang di-intersep pada fase capture.
*   **Penilaian Berkala:**
    *   Evaluasi terhadap kebijakan akses database, konfigurasi jaringan VPC, dan tinjauan arsitektur kode secara triwulanan.

---

## 11. Peningkatan Kontrol Keamanan

Sebagai bagian dari perbaikan berkelanjutan (*Continuous Improvement*):

*   **Audit Kebijakan RLS:** Tinjauan rutin terhadap kebijakan Row-Level Security (RLS) di database PostgreSQL guna memastikan tidak adanya kebocoran akses data antar-perusahaan (misal: Bank A melihat data Bank B).
*   **Minimalisasi Hak Istimewa (Principle of Least Privilege):** Membatasi hak akses administratif. Kunci akses administratif superuser (`service_role_key`) hanya diizinkan untuk digunakan di tingkat backend/Edge Function yang terisolasi dan dilarang keras bocor ke sisi klien peramban.

---

## 12. Rencana Tanggap Insiden (Incident Response Plan)

Lendana menetapkan prosedur tanggap darurat jika terdeteksi insiden kebocoran data atau serangan siber:

1.  **Deteksi & Pelaporan:** Sistem pemantauan cloud mendeteksi lonjakan akses tidak wajar (API abuse) atau kegagalan pencocokan data hash (`hash_verified = FALSE` pada view `loan_applications_verified`). Notifikasi langsung dikirim ke Tim Keamanan Informasi.
2.  **Karantina (Containment):** Sesi pengguna yang dicurigai dibekukan secara sepihak, dan alamat IP terkait diblokir melalui sistem Web Application Firewall (WAF).
3.  **Investigasi:** Tim menggunakan catatan log audit dari tabel `audit_logs` untuk melacak asal-usul modifikasi dan mengidentifikasi luasnya dampak kebocoran data.
4.  **Pemulihan & Notifikasi:** Data dipulihkan menggunakan sistem backup terbaru. Sesuai regulasi UU PDP dan OJK, Lendana akan mengirimkan notifikasi resmi kepada OJK dan pengguna terdampak dalam waktu maksimal 3x24 jam sejak insiden terkonfirmasi.

---

## 13. Langkah dan Perangkat Tindakan Keamanan

Platform Lendana menggunakan berbagai perangkat lunak dan arsitektur pengamanan sistem teruji:

*   **Web Application Firewall (WAF):** Menyaring trafik HTTP ilegal, mencegah serangan SQL Injection, Cross-Site Scripting (XSS), dan serangan DDoS.
*   **PostgreSQL Triggers & Functions:** Menjaga integritas data langsung dari tingkat kernel database, memastikan aturan bisnis (seperti immutability data) tidak dapat di-bypass oleh kode backend yang bermasalah.
*   **pg_sodium (Kriptografi Database):** Memastikan enkripsi kolom NIK KTP menggunakan standar kriptografi bersertifikasi industri.
*   **Dynamic Signed URLs:** Memastikan file gambar KTP pemohon tidak dapat diakses atau di-hotlink oleh pihak publik tanpa token izin berdurasi pendek.

---

## 14. Pemantauan dan Peninjauan Berkala

Kebijakan dan perlindungan siber Lendana tidak bersifat statis, melainkan ditinjau secara terus-menerus:

*   **Penetrasi Uji Coba Keamanan (Vulnerability & Pen-Testing):**
    *   Pengujian celah keamanan aplikasi (*Penetration Testing*) dilakukan minimal **1 (satu) kali setiap tahun** menggunakan jasa auditor pihak ketiga bersertifikat CEH (Certified Ethical Hacker) atau OSCP.
*   **Tinjauan Log Audit:**
    *   Tabel `audit_logs` dan `user_consent_logs` diekspor dan ditinjau secara berkala oleh Divisi Kepatuhan internal untuk memastikan tidak adanya anomali akses administratif di luar jam kerja operasional.
