# Product Requirement Document (PRD) - Tempolendana (Lendana PMI)

## 1. Project Overview
**Tempolendana** adalah platform teknologi finansial yang dikembangkan untuk memfasilitasi dan mendemokrasikan akses kredit bagi Pekerja Migran Indonesia (PMI). Platform ini berfungsi sebagai ekosistem digital yang menghubungkan peminjam (PMI, Wirausaha, Perusahaan) dengan institusi keuangan (Bank), perusahaan asuransi, dan agensi penagihan.

## 2. Tujuan Produk
*   **Efisiensi**: Mempercepat proses pengajuan pinjaman KUR-PMI melalui digitalisasi dokumen.
*   **Transparansi**: Memberikan pelacakan status pinjaman secara real-time kepada pengguna.
*   **Standarisasi**: Menyediakan alur kerja validasi yang seragam bagi agen dan validator.
*   **Kepatuhan**: Memenuhi standar regulasi OJK (Otoritas Jasa Keuangan) terkait privasi data dan transparansi informasi.

## 3. Profil Pengguna (User Roles)
*   **PMI (User)**: Pekerja migran yang mencari pinjaman penempatan atau KUR perumahan.
*   **Agent / Checker Agent**: Pihak yang membantu pendaftaran dan verifikasi awal data PMI.
*   **Validator**: Pihak independen yang melakukan validasi keabsahan aplikasi.
*   **Bank Staff**: Staf dari bank mitra yang meninjau, menyetujui, atau menolak pinjaman.
*   **Insurance & Collector**: Mitra yang terlibat dalam mitigasi risiko dan pemulihan kredit.
*   **Admin**: Administrator sistem yang mengelola entitas bank, cabang, produk, dan mitra agen.

## 4. Fitur Utama (Functional Requirements)

### 4.1. Manajemen Autentikasi & Profil
*   Registrasi multi-role (PMI, Agent, Bank Staff, dll).
*   Alur pendaftaran khusus untuk entitas Bisnis (Wirausaha) dan Korporasi (Perusahaan).
*   Manajemen sesi dengan fitur *idle timeout* (oto-logout setelah 10 menit) untuk keamanan.

### 4.2. Alur Pengajuan Pinjaman (Loan Workflow)
*   Pembuatan aplikasi pinjaman dengan formulir dinamis berdasarkan jenis produk (Placement, Rumah, Wirausaha).
*   Sistem unggah dokumen (Foto KTP, Foto Selfie) dengan validasi ukuran dan format.
*   Fitur **Bulk Upload**: Memungkinkan agen mengunggah banyak aplikasi sekaligus menggunakan file CSV.
*   Pelacakan status aplikasi secara detail (Status: Submitted, Under Review, Validated, Approved, Rejected).

### 4.3. Dashboard Berbasis Peran
*   **Dashboard Admin**: Manajemen CRUD untuk Bank, Cabang, Produk Kredit, Perusahaan Agen, dan Asuransi. Visualisasi statistik sistem.
*   **Dashboard User**: Melihat rincian pinjaman aktif dan riwayat pengajuan.
*   **Dashboard Bank**: Antarmuka untuk meninjau aplikasi yang masuk ke cabang spesifik mereka.

### 4.4. Kepatuhan & Keamanan Data (Compliance)
*   **Consent Logging**: Pencatatan persetujuan pengguna terhadap kebijakan privasi (OJK requirement).
*   **Right to Deletion**: Mekanisme bagi pengguna untuk mengajukan penghapusan akun dan data pribadi.
*   **Immutability**: Logika untuk memastikan data pinjaman tidak dapat diubah setelah mencapai status tertentu.

## 5. Spesifikasi Teknis (Technical Stack)
*   **Frontend**: React 18, Vite (TypeScript).
*   **UI/UX**: Tailwind CSS, Radix UI (Shadcn), Framer Motion untuk animasi premium.
*   **Backend & Database**: Supabase (PostgreSQL, Real-time, Auth, Storage).
*   **Security**: Row Level Security (RLS) di PostgreSQL untuk isolasi data antar role.

## 6. Model Data Utama
*   `users`: Identitas inti pengguna.
*   `loan_applications`: Data aplikasi, status, dan URL dokumen.
*   `banks` & `bank_branches`: Konfigurasi perbankan mitra.
*   `agent_companies`: Entitas penyalur/pendamping.
*   `user_consents` & `registration_logs`: Audit trail untuk kepatuhan regulasi.

## 7. Non-Functional Requirements
*   **Performance**: *Lazy loading* komponen untuk memastikan dashboard yang berat tetap responsif.
*   **Reliability**: Mekanisme timeout pada fungsi API untuk mencegah *hanging* saat koneksi buruk.
*   **SEO**: Implementasi meta tags dan struktur HTML semantik pada Landing Page.

---
*Dokumen ini dibuat secara otomatis oleh Antigravity sebagai dasar referensi pengembangan produk Tempolendana.*
