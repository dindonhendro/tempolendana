# Timeline Penyelesaian Pengembangan Sistem Lendana

**Dokumen:** Rencana Strategis & Solusi Teknologi Informasi
**Proyek:** Lendana Financial Web App (Kredit Usaha Rakyat PMI)
**Periode Fokus:** September 2025 - Mei 2026
**Diajukan ke:** Otoritas Jasa Keuangan (OJK)

---

## Ringkasan Eksekutif

Dokumen ini merinci jadwal rancang bangun, integrasi, dan rencana perilisan (*Go-Live*) aplikasi portal pengajuan KUR PMI: **Lendana**. Proses rekayasa perangkat lunak dimulai secara spesifik pada **September 2025** dan ditargetkan untuk siap dioperasikan penuh (*Go-Live*) bersamaan dengan rampungnya integrasi sistem **Pembuatan Visa Keluar Negeri** pada **akhir Mei 2026**.

---

## Linimasa Pengembangan (Development Timeline)

### Fase 1: Inisiasi & Analisis Kebutuhan Bisnis (September - Oktober 2025)
Fokus pada pemahaman proses bisnis, regulasi, dan rancangan awal aplikasi.
*   **Pengumpulan Kebutuhan (Requirement Gathering):** Wawancara dengan *stakeholder* internal, LJK, dan P3MI untuk menyusun *Business Requirements Document* (BRD).
*   **Pemetaan Alur Bisnis (Business Process Mapping):** Mendefinisikan alur pengajuan pinjaman KUR PMI dari hulu ke hilir.
*   **Analisis Kepatuhan Regulasi:** Evaluasi rancangan sistem terhadap POJK Perlindungan Konsumen, Manajemen Risiko TI OJK, serta kepatuhan UU PDP (Pelindungan Data Pribadi).
*   **Perancangan UI/UX:** Pembuatan purwarupa (*wireframing* dan *prototyping*) antarmuka aplikasi untuk semua peran pengguna (Pendaftar, Admin, LJK, P3MI, Asuransi).

### Fase 2: Pengembangan Infrastruktur & Sistem Inti (November 2025 - Januari 2026)
Fokus pada pembangunan pondasi teknologi dan fungsi dasar aplikasi.
*   **Setup Infrastruktur:** Penyediaan *server bare-metal*, konfigurasi arsitektur jaringan, serta penyiapan pangkalan data terpusat (PostgreSQL/Supabase).
*   **Pengembangan Frontend:** Koding antarmuka pengguna berbasis SPA (React/Vite) untuk *Landing Page* dan *User Dashboard*.
*   **Manajemen Identitas & Akses:** Implementasi Supabase Auth, alur registrasi, dan penerapan *Role-Based Access Control* (RBAC) yang ketat.
*   **Modul Komputasi Finansial:** Pemrograman logika perhitungan simulasi kredit, validasi rentang plafon, perhitungan bunga efektif KUR, dan biaya provisi.
*   **Manajemen Dokumen KYC:** Pembuatan fungsi unggah foto dan dokumen identitas ke *Cloud Storage* internal secara aman.

### Fase 3: Pengembangan Modul Lanjutan & Integrasi Internal (Februari - Maret 2026)
Fokus pada fitur administratif, pelacakan proses, dan stabilitas internal.
*   **Pengembangan Panel LJK & P3MI:** Membangun antarmuka khusus (dasbor) bagi mitra bank untuk mengakses data aplikan dan memproses persetujuan pencairan dana (*disbursement*).
*   **Modul Operasional Tambahan:** Pembuatan sistem penugasan asuransi kredit dan verifikator lapangan (*collector*).
*   **Fitur Kepatuhan (Compliance Features):** Implementasi modul terminasi sesi otomatis dalam 10 menit (*Session Timeout Inactivity*) dan perekaman Log Jejak Audit (*Audit Trail* & *Consent Logs*).
*   **Pengujian Internal:** Eksekusi *Unit Testing* dan *System Integration Testing* untuk memastikan tidak ada kesalahan fungsi (bug) pada modul esensial.

### Fase 4: Integrasi Pihak Ketiga & Pengujian Penerimaan (UAT) (April 2026)
Fokus pada konektivitas eksternal dan validasi proses dengan rekan komersial.
*   **Integrasi Payment Gateway:** Penyambungan dengan API pihak ketiga (contoh: Winpay SNAP) untuk memfasilitasi pembuatan *Virtual Account* atau QRIS sebagai kanal pelunasan atau pencairan.
*   **User Acceptance Testing (UAT):** Pengujian sistem secara end-to-end langsung oleh pengguna akhir yang representatif (Staf Bank, Agensi P3MI, dan sampel PMI) pada lingkungan *Staging*.
*   **Perbaikan Kutu & Penyesuaian (Bug Fixing):** Mengakomodasi masukan dari hasil UAT untuk penyempurnaan alur kerja (*workflow*).
*   **Dokumentasi Pengguna:** Penyusunan SOP operasional dan *User Manual* bagi setiap tingkatan otorisasi.

### Fase 5: Integrasi Pembuatan Visa Eksternal & GO-LIVE (Mei 2026)
Fokus integrasi syarat keberangkatan PMI dan peluncuran layanan langsung ke publik.
*   **Minggu 1-2 (Awal Mei):** Perancangan dan penyambungan API dua arah secara *real-time* dengan portal **Sistem Pembuatan Visa Keluar Negeri**. Lendana akan menyuplai status pembiayaan ("Diizinkan"/"Ditolak") sebagai dokumen pengganti syarat finansial visa untuk imigrasi.
*   **Minggu 3 (Pertengahan Mei):** Simulasi transaksi *end-to-end* yang melibatkan pengajuan KUR dan pembacaan stempel kelayakan oleh layanan penerbitan Visa (*Load Testing* skala penuh).
*   **Minggu 4 (Akhir Mei 2026):** **Go-Live / Rilis Produksi Utama**. Migrasi dari server *staging* ke *production*. Layanan Lendana dibuka untuk umum dan pemrosesan kredit siap dioperasikan penuh pada seluruh kanal.

---

## Rangkuman Target Tanggal (Key Milestones)

| Milestone Fase | Periode Eksekusi | Keterangan Luaran (Output) |
| :--- | :--- | :--- |
| **Inisiasi & Analisis BRD** | Sep 2025 - Okt 2025 | Persetujuan Spesifikasi Kebutuhan Perangkat Lunak & Regulasi. |
| **Pengembangan Inti (Core Apps)** | Nov 2025 - Jan 2026 | Aplikasi dasar terbentuk, manajemen akun, & komputasi kredit. |
| **Modul Lanjutan & Internal Test** | Feb 2026 - Mar 2026 | Panel LJK/P3MI aktif, implementasi *Audit Log* selesai. |
| **Integrasi Eksternal & UAT** | Apr 2026 | *Payment Gateway* terhubung & BA UAT disetujui para entitas. |
| **Integrasi Visa & Finalisasi** | Awal - Pertengahan Mei 2026 | *Endpoint* Status Pembiayaan vs Sistem Visa tersinkronisasi murni. |
| **Soft Launch & Public Go-Live** | Akhir Mei 2026 | Aplikasi Lendana resmi beroperasi penuh untuk masyarakat. |
