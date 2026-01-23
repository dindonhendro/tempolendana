# Standard Operating Procedure (SOP): Pengelolaan & Pemantauan Audit Trail

**Nama Dokumen:** SOP-LENDANA-SEC-001  
**Versi:** 1.0.0  
**Tanggal Berlaku:** 20 Januari 2026  
**Klasifikasi:** Internal & OJK Compliance  

---

## 1. Tujuan
SOP ini disusun untuk memastikan platform Tempo Lendana memiliki mekanisme pencatatan aktivitas sistem yang akurat, otomatis, dan tahan manipulasi (immutability). Hal ini bertujuan untuk mendukung transparansi, akuntabilitas, serta kepatuhan terhadap regulasi OJK mengenai Penyelenggaraan Layanan Pendanaan Bersama Berbasis Teknologi Informasi.

## 2. Ruang Lingkup
Prosedur ini mencakup seluruh aktivitas kritikal pada database platform Tempo Lendana, meliputi namun tidak terbatas pada:
*   Pendaftaran dan perubahan data pengguna.
*   Pemrosesan aplikasi pinjaman (KUR-PMI dan P3MI).
*   Pengelolaan keluhan pelanggan (Ticketing System).
*   Aktivitas administratif oleh pengguna internal (Admin/Validator).

## 3. Kebijakan Teknis Audit Trail
Sistem Audit Trail Tempo Lendana wajib memenuhi karakteristik berikut:
1.  **Immutability (Imutabilitas):** Log audit disimpan dalam tabel *append-only*. Tidak ada pengguna, termasuk Admin, yang diberikan hak akses untuk mengedit atau menghapus record dalam tabel `system_audit_logs`.
2.  **Integrasi Hash SHA-256:** Setiap baris log akan menghasilkan hash kriptografi unik yang mengikat data log tersebut secara permanen.
3.  **Real-time Event Logging:** Pencatatan terjadi secara otomatis melalui *database triggers* pada saat transaksi data terjadi.
4.  **Data Context:** Log harus mencatat:
    *   Waktu kejadian (*event_timestamp*).
    *   Identitas pelaku (*actor_id*).
    *   Jenis aksi (*INSERT, UPDATE, DELETE*).
    *   Data sebelum perubahan (*old_data*) dan sesudah perubahan (*new_data*).

## 4. Prosedur Pengelolaan

### 4.1 Pencatatan Otomatis
1.  Sistem secara otomatis mengaktifkan fungsionalitas `global_track_changes` pada setiap tabel kritikal.
2.  Data perubahan ditangkap dalam format JSONB untuk memastikan fleksibilitas analisis.
3.  Setiap data yang masuk ke tabel audit akan diverifikasi integritasnya melalui fungsi `trg_compute_audit_log_hash`.

### 4.2 Pemantauan dan Review
1.  **Review Berkala:** Tim Kepatuhan (Compliance Officer) melakukan review berkala terhadap log audit minimal satu kali dalam sebulan.
2.  **Investigasi Insiden:** Jika terjadi anomali data, log audit digunakan sebagai sumber kebenaran tunggal (*Single Source of Truth*) untuk investigasi forensik.

### 4.3 Akses Kontrol
1.  Akses baca terhadap tabel audit dibatasi hanya untuk pengguna dengan peran `admin` atau `auditor` melalui *Row Level Security* (RLS).
2.  Setiap akses baca terhadap log audit akan direkam kembali oleh sistem sebagai bagian dari log keamanan.

## 5. Pemeliharaan dan Retensi Data
1.  **Penyimpanan:** Data audit trail disimpan di dalam infrastruktur database yang terenkripsi (Encryption at Rest).
2.  **Retensi:** Data audit trail wajib disimpan minimal selama 5 (lima) tahun atau sesuai dengan ketentuan terbaru dari OJK.
3.  **Backup:** Backup database audit trail dilakukan secara harian dan disimpan di lokasi terpisah untuk pemulihan bencana (*Disaster Recovery*).

## 6. Sanksi
Pelanggaran terhadap prosedur ini, termasuk upaya penetrasi atau manipulasi terhadap sistem audit trail, akan dikenakan sanksi disiplin berat dan dapat diproses secara hukum sesuai dengan UU ITE dan regulasi OJK yang berlaku.

---
**Disetujui Oleh:**  
Management Tempo Lendana
