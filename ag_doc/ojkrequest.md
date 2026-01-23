# Product Requirements Document (PRD): Fitur Kepatuhan OJK (OJK Request)

**Nama Dokumen:** ojkrequest.md  
**Status:** Draft  
**Tanggal:** 20 Januari 2026  
**Tujuan:** Memenuhi persyaratan transparansi informasi produk dan perlindungan konsumen sesuai regulasi OJK.

---

## 1. Latar Belakang
Berdasarkan permintaan dari OJK, platform Tempo Lendana perlu meningkatkan transparansi produk melalui fitur perbandingan dan menyediakan saluran pengaduan konsumen yang terintegrasi (Ticketing System) untuk memastikan perlindungan pengguna, terutama bagi Pekerja Migran Indonesia (PMI) dan Perusahaan Penempatan Pekerja Migran Indonesia (P3MI).

---

## 2. Fitur Utama

### 2.1 Kartu Produk Bank & Perbandingan (Main Page)
**Deskripsi:** Penambahan section pada halaman utama yang menampilkan kartu produk dari bank mitra agar pengguna dapat membandingkan opsi pinjaman sebelum mengajukan.

**Produk yang ditampilkan:**
1.  **KUR-PMI (Kredit Usaha Rakyat - Pekerja Migran Indonesia):** 
    *   Target: Calon PMI.
    *   Informasi: Suku bunga bersubsidi, plafon maksimal, dan persyaratan dokumen (E-ID, Paspor, dll).
2.  **Pinjaman Modal Usaha untuk P3MI:**
    *   Target: Perusahaan Penempatan (P3MI).
    *   Informasi: Plafon modal kerja, tenor, dan syarat badan hukum.

**Komponen UI:**
- Kartu (Cards) yang memuat: Nama Bank, Nama Produk, Bunga per Tahun, Tenor Maksimal.
- Tombol "Bandingkan" atau "Lihat Detail".
- Filter kategori (PMI vs P3MI).

### 2.2 Footer: Tombol "Hubungi Kami"
**Deskripsi:** Memberikan akses cepat bagi pengguna untuk berinteraksi dengan Customer Service.

**Fungsionalitas:**
- Letak: Footer di setiap halaman.
- Aksi: Mengarahkan ke halaman kontak atau membuka modal form pertanyaan.
- Data yang dikumpulkan: Nama, Email/No. WhatsApp, dan kategori pertanyaan.

### 2.3 Sistem Keluhan Pelanggan & Ticketing
**Deskripsi:** Fitur khusus untuk pengguna yang sudah mengajukan pinjaman namun statusnya belum jelas atau menghadapi kendala dalam proses aplikasi.

**User Flow:**
1.  User mengklik tombol **"Keluhan Pelanggan"** di dashboard atau pusat bantuan.
2.  User mengisi formulir keluhan (ID Aplikasi, Deskripsi Kendala, Unggah Bukti/Screenshot).
3.  Sistem menghasilkan **Ticket ID** (contoh: #TL-202601-001).
4.  User mendapatkan konfirmasi melalui email/WhatsApp bahwa keluhan telah diterima.
5.  User dapat memantau status tiket (Open, In Progress, Resolved).

- Notifikasi status update kepada user.

### 2.4 Global System Audit Trail (Jejak Audit Seluruh Sistem)
**Deskripsi:** Implementasi sistem pencatatan log tunggal yang mencatat setiap aktivitas kritikal di seluruh platform Tempo Lendana (User, Pinjaman, Data Bank, dan Keluhan) untuk memenuhi standar audit OJK.

**Karakteristik & Integritas Dasar:**
1.  **Otomatis & Real-time:** Pencatatan dilakukan oleh sistem di level database (SQL Triggers) setiap kali ada data yang diubah, dihapus, atau ditambah.
2.  **Imutabel (Immutable):** Menggunakan tabel *append-only* dengan proteksi RLS dan Trigger yang melarang adanya penghapusan atau modifikasi pada log audit.
3.  **Terenkripsi & Hashing:** Menggunakan SHA-256 integrity hash pada setiap baris log untuk memastikan log tidak dapat dimanipulasi secara database. Data sensitif dilindungi dengan enkripsi AES-256.
4.  **Konteks Lengkap:** Mencatat User ID, IP Address, User Agent, Timestamp, Nama Tabel, serta data lama (Old Data) dan data baru (New Data) dalam format JSONB.
5.  **Dapat Dianalisa:** Log terstruktur secara sistematis untuk keperluan audit reguler dan investigasi forensik digital.

---

## 3. Persyaratan Teknis & Desain
- **UI/UX:** Desain harus konsisten dengan branding Tempo Lendana, menggunakan komponen yang *clean* dan *mobile-friendly*.
- **Keamanan:** Data keluhan dan log audit harus tersimpan dengan aman menggunakan enkripsi (AES-256) dan hanya dapat diakses oleh admin/auditor resmi.
- **Integritas Data:** Mengimplementasikan hashing untuk memastikan Audit Trail bersifat imutabel.
- **Transparansi:** Informasi bunga dan biaya pada kartu produk bank harus up-to-date sesuai perjanjian kerjasama bank.

---

## 4. Prioritas Implementasi
1.  **P1:** Sistem Keluhan & Ticketing (Kritikal untuk kepatuhan perlindungan konsumen).
2.  **P2:** Kartu Produk Bank KUR-PMI & P3MI (Transparansi produk).
3.  **P3:** Tombol Hubungi Kami di Footer.
