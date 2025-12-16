# Standard Operating Procedure (SOP)
# Verifikasi Akun Pengguna
# PT. Lendana Digitalindo Nusantara

**Nomor Dokumen:** SOP-ACC-001  
**Versi:** 1.0  
**Tanggal Efektif:** Januari 2025  
**Klasifikasi:** Internal - Operasional

---

## Daftar Isi

1. [Tujuan](#1-tujuan)
2. [Ruang Lingkup](#2-ruang-lingkup)
3. [Definisi dan Istilah](#3-definisi-dan-istilah)
4. [Klasifikasi Role Pengguna](#4-klasifikasi-role-pengguna)
5. [Alur Pembuatan Akun Berdasarkan Role](#5-alur-pembuatan-akun-berdasarkan-role)
6. [SOP Verifikasi Akun Role User (PMI)](#6-sop-verifikasi-akun-role-user-pmi)
7. [SOP Verifikasi Akun Role P3MI/Wirausaha](#7-sop-verifikasi-akun-role-p3miwirausaha)
8. [SOP Verifikasi Akun Role Agent](#8-sop-verifikasi-akun-role-agent)
9. [SOP Verifikasi Akun Role Checker](#9-sop-verifikasi-akun-role-checker)
10. [SOP Verifikasi Akun Role Validator](#10-sop-verifikasi-akun-role-validator)
11. [SOP Verifikasi Akun Role Bank Staff](#11-sop-verifikasi-akun-role-bank-staff)
12. [SOP Verifikasi Akun Role Insurance](#12-sop-verifikasi-akun-role-insurance)
13. [SOP Verifikasi Akun Role Collector](#13-sop-verifikasi-akun-role-collector)
14. [SOP Verifikasi Akun Role Admin](#14-sop-verifikasi-akun-role-admin)
15. [Matriks Persetujuan Berjenjang](#15-matriks-persetujuan-berjenjang)
16. [Dokumen Pendukung](#16-dokumen-pendukung)
17. [Ketentuan Keamanan](#17-ketentuan-keamanan)
18. [Lampiran](#18-lampiran)

---

## 1. Tujuan

SOP ini bertujuan untuk:

1. Menetapkan prosedur standar pembuatan dan verifikasi akun pengguna di platform Lendana
2. Memastikan setiap akun dibuat dengan otorisasi yang tepat sesuai jenjang persetujuan
3. Menjamin keamanan sistem dengan verifikasi identitas yang ketat
4. Memenuhi persyaratan kepatuhan OJK untuk pengelolaan akses sistem

---

## 2. Ruang Lingkup

SOP ini berlaku untuk:

| Kategori | Keterangan |
|----------|------------|
| **Pemohon Akun** | Seluruh calon pengguna platform Lendana |
| **Pembuat Akun** | Tim IT, Admin, dan pihak yang berwenang |
| **Penyetuju** | Manajemen sesuai jenjang persetujuan |
| **Sistem** | Platform Lendana Financial Access |

---

## 3. Definisi dan Istilah

| Istilah | Definisi |
|---------|----------|
| **PKS** | Perjanjian Kerja Sama antara Lendana dengan Mitra |
| **MoU** | Memorandum of Understanding |
| **Role** | Peran/hak akses pengguna dalam sistem |
| **Self-Registration** | Pendaftaran mandiri oleh pengguna |
| **Admin-Created** | Akun dibuat oleh administrator setelah PKS |
| **OJK** | Otoritas Jasa Keuangan |
| **PMI** | Pekerja Migran Indonesia |
| **P3MI** | Perusahaan Penempatan Pekerja Migran Indonesia |

---

## 4. Klasifikasi Role Pengguna

### 4.1 Kategori Berdasarkan Metode Pembuatan Akun

```
┌─────────────────────────────────────────────────────────────────┐
│              KLASIFIKASI PEMBUATAN AKUN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           SELF-REGISTRATION (Mandiri)                   │   │
│  │                                                          │   │
│  │   • User (PMI)                                          │   │
│  │   • P3MI / Wirausaha                                    │   │
│  │                                                          │   │
│  │   → Dapat mendaftar sendiri melalui website             │   │
│  │   → Verifikasi email otomatis                           │   │
│  │   → Untuk pengajuan pinjaman                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           ADMIN-CREATED (Setelah PKS)                   │   │
│  │                                                          │   │
│  │   • Agent                                               │   │
│  │   • Checker                                             │   │
│  │   • Validator                                           │   │
│  │   • Bank Staff                                          │   │
│  │   • Insurance                                           │   │
│  │   • Collector                                           │   │
│  │   • Admin                                               │   │
│  │                                                          │   │
│  │   → Harus ada PKS/Kontrak terlebih dahulu              │   │
│  │   → Dibuat oleh Admin setelah persetujuan berjenjang   │   │
│  │   → Untuk operasional sistem                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Daftar Role dan Hak Akses

| No | Role | Deskripsi | Metode Pembuatan |
|----|------|-----------|------------------|
| 1 | **User** | Pemohon pinjaman (PMI) | Self-Registration |
| 2 | **P3MI/Wirausaha** | Perusahaan penempatan / Pengusaha | Self-Registration |
| 3 | **Agent** | Petugas lapangan Lendana | Admin-Created (PKS) |
| 4 | **Checker** | Quality Control internal | Admin-Created (PKS) |
| 5 | **Validator** | Validator Lendana | Admin-Created (Internal) |
| 6 | **Bank Staff** | Petugas bank mitra | Admin-Created (PKS) |
| 7 | **Insurance** | Petugas asuransi mitra | Admin-Created (PKS) |
| 8 | **Collector** | Petugas penagihan | Admin-Created (PKS) |
| 9 | **Admin** | Administrator sistem | Admin-Created (Internal) |

---

## 5. Alur Pembuatan Akun Berdasarkan Role

### 5.1 Alur Self-Registration (User & P3MI)

```
┌─────────────────────────────────────────────────────────────────┐
│              ALUR SELF-REGISTRATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │   START     │                                               │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. User mengakses halaman registrasi                    │   │
│  │    https://lendana.co.id/register                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. Mengisi form registrasi:                             │   │
│  │    - Email                                               │   │
│  │    - Password                                            │   │
│  │    - Nama Lengkap                                        │   │
│  │    - Pilih Role (User/P3MI)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. Sistem mengirim email verifikasi                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. User klik link verifikasi di email                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 5. Akun aktif - dapat login dan mengajukan pinjaman     │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │    END      │                                               │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Alur Admin-Created (Setelah PKS)

```
┌─────────────────────────────────────────────────────────────────┐
│              ALUR ADMIN-CREATED (SETELAH PKS)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │   START     │                                               │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. NEGOSIASI & PENANDATANGANAN PKS                      │   │
│  │    - MoU / Perjanjian Kerja Sama                        │   │
│  │    - Ditandatangani kedua belah pihak                   │   │
│  │    - Dilegalisir (jika diperlukan)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. PENGAJUAN PEMBUATAN AKUN                             │   │
│  │    - Mitra mengajukan daftar user yang akan dibuat      │   │
│  │    - Melampirkan dokumen pendukung                      │   │
│  │    - Form Pengajuan Akun (Lampiran A)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. VERIFIKASI DOKUMEN                                   │   │
│  │    - Tim Legal verifikasi PKS                           │   │
│  │    - Tim HR/Admin verifikasi identitas user             │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. PERSETUJUAN BERJENJANG                               │   │
│  │    - Sesuai matriks persetujuan (Section 15)            │   │
│  │    - Approval dari pejabat berwenang                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 5. PEMBUATAN AKUN OLEH ADMIN                            │   │
│  │    - Admin IT membuat akun di sistem                    │   │
│  │    - Generate password sementara                        │   │
│  │    - Assign role sesuai PKS                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 6. DISTRIBUSI KREDENSIAL                                │   │
│  │    - Kirim email aktivasi ke user                       │   │
│  │    - User wajib ganti password saat login pertama       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 7. AKTIVASI & TRAINING                                  │   │
│  │    - User login dan ganti password                      │   │
│  │    - Training penggunaan sistem (jika diperlukan)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │    END      │                                               │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. SOP Verifikasi Akun Role User (PMI)

### 6.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | User |
| **Target Pengguna** | Pekerja Migran Indonesia (PMI) |
| **Metode Pembuatan** | Self-Registration |
| **Syarat PKS** | ❌ Tidak diperlukan |
| **Hak Akses** | Mengajukan pinjaman, upload dokumen, tracking status |

### 6.2 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | User mengakses halaman registrasi | User | - |
| 2 | Mengisi form registrasi dengan data valid | User | 5 menit |
| 3 | Sistem validasi format email dan password | Sistem | Otomatis |
| 4 | Sistem mengirim email verifikasi | Sistem | Otomatis |
| 5 | User klik link verifikasi (valid 24 jam) | User | - |
| 6 | Akun aktif dengan status "Verified" | Sistem | Otomatis |

### 6.3 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | Email aktif | Untuk verifikasi dan notifikasi |
| 2 | Nomor HP aktif | Untuk OTP (jika diperlukan) |

### 6.4 Flowchart

```
User → Registrasi → Verifikasi Email → Akun Aktif → Login → Ajukan Pinjaman
```

---

## 7. SOP Verifikasi Akun Role P3MI/Wirausaha

### 7.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | P3MI / Wirausaha |
| **Target Pengguna** | Perusahaan Penempatan PMI, Pengusaha |
| **Metode Pembuatan** | Self-Registration |
| **Syarat PKS** | ❌ Tidak diperlukan untuk registrasi awal |
| **Hak Akses** | Mengajukan pinjaman bisnis, upload dokumen |

### 7.2 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | User mengakses halaman registrasi | User | - |
| 2 | Pilih role "P3MI" atau "Wirausaha" | User | - |
| 3 | Mengisi form registrasi dengan data perusahaan | User | 10 menit |
| 4 | Sistem validasi format data | Sistem | Otomatis |
| 5 | Sistem mengirim email verifikasi | Sistem | Otomatis |
| 6 | User klik link verifikasi | User | - |
| 7 | Akun aktif dengan status "Verified" | Sistem | Otomatis |

### 7.3 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | Email perusahaan | Untuk verifikasi |
| 2 | Nomor HP PIC | Untuk komunikasi |
| 3 | NIB/SIUP | Diupload saat pengajuan pinjaman |

---

## 8. SOP Verifikasi Akun Role Agent

### 8.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Agent |
| **Target Pengguna** | Petugas lapangan Lendana / Mitra |
| **Metode Pembuatan** | Admin-Created (Setelah PKS) |
| **Syarat PKS** | ✅ **WAJIB** - PKS dengan Lendana |
| **Hak Akses** | Review aplikasi, update status, assign checker |

### 8.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRASYARAT PEMBUATAN AKUN AGENT               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ PKS antara Lendana dengan Mitra sudah ditandatangani       │
│  ✅ Daftar nama agent sudah diajukan oleh Mitra                │
│  ✅ KTP dan data identitas agent sudah diverifikasi            │
│  ✅ Persetujuan dari Manager Operations                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | Mitra mengajukan PKS ke Lendana | Mitra | - |
| 2 | Tim Legal review dan finalisasi PKS | Legal | 3-5 hari |
| 3 | PKS ditandatangani kedua belah pihak | Direktur | 1 hari |
| 4 | Mitra mengajukan daftar agent (Form A) | Mitra | - |
| 5 | Tim HR verifikasi identitas agent | HR | 1-2 hari |
| 6 | Manager Operations approve | Manager Ops | 1 hari |
| 7 | Admin IT membuat akun | Admin IT | 1 hari |
| 8 | Kirim kredensial ke agent via email | Admin IT | Otomatis |
| 9 | Agent login dan ganti password | Agent | - |
| 10 | Training penggunaan sistem | Training | 1 hari |

### 8.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **PKS** | Perjanjian Kerja Sama yang sudah ditandatangani |
| 2 | **Form Pengajuan Akun** | Lampiran A |
| 3 | **KTP Agent** | Scan/foto yang jelas |
| 4 | **Surat Penunjukan** | Dari perusahaan mitra |
| 5 | **Pas Foto** | 3x4 background merah |

### 8.5 Jenjang Persetujuan

```
Mitra Request → HR Verify → Manager Ops Approve → Admin IT Create
```

---

## 9. SOP Verifikasi Akun Role Checker

### 9.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Checker |
| **Target Pengguna** | Quality Control internal Lendana |
| **Metode Pembuatan** | Admin-Created (Internal) |
| **Syarat PKS** | ❌ Internal Lendana (Kontrak Kerja) |
| **Hak Akses** | QC aplikasi, verifikasi dokumen, approve/reject |

### 9.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRASYARAT PEMBUATAN AKUN CHECKER               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Karyawan internal Lendana                                  │
│  ✅ Kontrak kerja sudah ditandatangani                         │
│  ✅ Sudah lulus masa probation (jika ada)                      │
│  ✅ Persetujuan dari Manager QC dan HR Manager                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | HR mengajukan pembuatan akun checker | HR | - |
| 2 | Manager QC review dan approve | Manager QC | 1 hari |
| 3 | HR Manager approve | HR Manager | 1 hari |
| 4 | Admin IT membuat akun | Admin IT | 1 hari |
| 5 | Kirim kredensial ke checker | Admin IT | Otomatis |
| 6 | Checker login dan ganti password | Checker | - |
| 7 | Training SOP QC | Training | 2 hari |

### 9.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **Kontrak Kerja** | Yang sudah ditandatangani |
| 2 | **Form Pengajuan Akun** | Lampiran A |
| 3 | **KTP** | Scan/foto yang jelas |
| 4 | **Surat Penugasan** | Dari HR |

### 9.5 Jenjang Persetujuan

```
HR Request → Manager QC Approve → HR Manager Approve → Admin IT Create
```

---

## 10. SOP Verifikasi Akun Role Validator

### 10.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Validator |
| **Target Pengguna** | Validator senior Lendana |
| **Metode Pembuatan** | Admin-Created (Internal) |
| **Syarat PKS** | ❌ Internal Lendana (Kontrak Kerja) |
| **Hak Akses** | Final validation, approve ke bank, data immutability |

### 10.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│                 PRASYARAT PEMBUATAN AKUN VALIDATOR              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Karyawan internal Lendana level senior                     │
│  ✅ Minimal 1 tahun pengalaman di bidang kredit/finance        │
│  ✅ Sudah lulus sertifikasi internal                           │
│  ✅ Persetujuan dari Head of Operations dan Direktur           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | Head of Ops mengajukan pembuatan akun | Head of Ops | - |
| 2 | HR verifikasi kualifikasi | HR | 1 hari |
| 3 | Direktur Operations approve | Direktur Ops | 1 hari |
| 4 | Admin IT membuat akun | Admin IT | 1 hari |
| 5 | Kirim kredensial ke validator | Admin IT | Otomatis |
| 6 | Validator login dan ganti password | Validator | - |
| 7 | Training SOP Validasi & Compliance | Training | 3 hari |

### 10.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **Kontrak Kerja** | Yang sudah ditandatangani |
| 2 | **Form Pengajuan Akun** | Lampiran A |
| 3 | **Sertifikat Kompetensi** | Jika ada |
| 4 | **Surat Penugasan** | Dari Head of Operations |

### 10.5 Jenjang Persetujuan

```
Head of Ops Request → HR Verify → Direktur Ops Approve → Admin IT Create
```

---

## 11. SOP Verifikasi Akun Role Bank Staff

### 11.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Bank Staff |
| **Target Pengguna** | Petugas bank mitra (BNI, Mandiri, BRI, BTN, dll) |
| **Metode Pembuatan** | Admin-Created (Setelah PKS) |
| **Syarat PKS** | ✅ **WAJIB** - PKS dengan Bank Mitra |
| **Hak Akses** | Review aplikasi, approve/reject, update status disbursement |

### 11.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│               PRASYARAT PEMBUATAN AKUN BANK STAFF               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ PKS antara Lendana dengan Bank sudah ditandatangani        │
│  ✅ Surat penunjukan resmi dari Bank                           │
│  ✅ Daftar nama petugas sudah diajukan oleh Bank               │
│  ✅ Persetujuan dari Direktur Lendana                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | Bank mengajukan PKS ke Lendana | Bank | - |
| 2 | Tim Legal review dan finalisasi PKS | Legal | 5-10 hari |
| 3 | PKS ditandatangani (Direktur kedua pihak) | Direktur | 1-3 hari |
| 4 | Bank mengajukan daftar petugas (Form A) | Bank | - |
| 5 | Tim Legal verifikasi surat penunjukan | Legal | 2 hari |
| 6 | Direktur Lendana approve | Direktur | 1 hari |
| 7 | Admin IT membuat akun | Admin IT | 1 hari |
| 8 | Kirim kredensial ke bank staff | Admin IT | Otomatis |
| 9 | Bank staff login dan ganti password | Bank Staff | - |
| 10 | Training penggunaan sistem | Training | 1 hari |

### 11.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **PKS dengan Bank** | Ditandatangani Direktur kedua pihak |
| 2 | **Surat Penunjukan** | Resmi dari Bank |
| 3 | **Form Pengajuan Akun** | Lampiran A |
| 4 | **ID Karyawan Bank** | Scan/foto |
| 5 | **KTP** | Scan/foto yang jelas |

### 11.5 Jenjang Persetujuan

```
Bank Request → Legal Verify PKS → Direktur Approve → Admin IT Create
```

---

## 12. SOP Verifikasi Akun Role Insurance

### 12.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Insurance |
| **Target Pengguna** | Petugas asuransi mitra |
| **Metode Pembuatan** | Admin-Created (Setelah PKS) |
| **Syarat PKS** | ✅ **WAJIB** - PKS dengan Perusahaan Asuransi |
| **Hak Akses** | Review aplikasi, proses asuransi, update status |

### 12.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│               PRASYARAT PEMBUATAN AKUN INSURANCE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ PKS antara Lendana dengan Asuransi sudah ditandatangani    │
│  ✅ Surat penunjukan resmi dari Asuransi                       │
│  ✅ Daftar nama petugas sudah diajukan                         │
│  ✅ Persetujuan dari Manager Operations dan Direktur           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | Asuransi mengajukan PKS ke Lendana | Asuransi | - |
| 2 | Tim Legal review dan finalisasi PKS | Legal | 5-7 hari |
| 3 | PKS ditandatangani kedua belah pihak | Direktur | 1-2 hari |
| 4 | Asuransi mengajukan daftar petugas | Asuransi | - |
| 5 | Tim Legal verifikasi surat penunjukan | Legal | 1 hari |
| 6 | Manager Ops review | Manager Ops | 1 hari |
| 7 | Direktur approve | Direktur | 1 hari |
| 8 | Admin IT membuat akun | Admin IT | 1 hari |
| 9 | Kirim kredensial ke insurance staff | Admin IT | Otomatis |
| 10 | Training penggunaan sistem | Training | 1 hari |

### 12.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **PKS dengan Asuransi** | Ditandatangani kedua pihak |
| 2 | **Surat Penunjukan** | Resmi dari Asuransi |
| 3 | **Form Pengajuan Akun** | Lampiran A |
| 4 | **ID Karyawan** | Scan/foto |
| 5 | **KTP** | Scan/foto yang jelas |

### 12.5 Jenjang Persetujuan

```
Asuransi Request → Legal Verify → Manager Ops Review → Direktur Approve → Admin IT Create
```

---

## 13. SOP Verifikasi Akun Role Collector

### 13.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Collector |
| **Target Pengguna** | Petugas penagihan mitra |
| **Metode Pembuatan** | Admin-Created (Setelah PKS) |
| **Syarat PKS** | ✅ **WAJIB** - PKS dengan Perusahaan Collection |
| **Hak Akses** | View data debitur, update status pembayaran, tracking |

### 13.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│               PRASYARAT PEMBUATAN AKUN COLLECTOR                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ PKS antara Lendana dengan Collection Agency                │
│  ✅ Surat penunjukan resmi                                     │
│  ✅ Sertifikat AFPI (jika diperlukan)                          │
│  ✅ Persetujuan dari Manager Collection dan Direktur           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | Collection Agency mengajukan PKS | Agency | - |
| 2 | Tim Legal review PKS | Legal | 5-7 hari |
| 3 | PKS ditandatangani | Direktur | 1-2 hari |
| 4 | Agency mengajukan daftar collector | Agency | - |
| 5 | Verifikasi sertifikasi AFPI | Compliance | 2 hari |
| 6 | Manager Collection approve | Manager Coll | 1 hari |
| 7 | Direktur approve | Direktur | 1 hari |
| 8 | Admin IT membuat akun | Admin IT | 1 hari |
| 9 | Kirim kredensial | Admin IT | Otomatis |
| 10 | Training SOP Collection | Training | 2 hari |

### 13.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **PKS dengan Collection Agency** | Ditandatangani kedua pihak |
| 2 | **Surat Penunjukan** | Resmi dari Agency |
| 3 | **Sertifikat AFPI** | Jika diperlukan |
| 4 | **Form Pengajuan Akun** | Lampiran A |
| 5 | **KTP** | Scan/foto yang jelas |
| 6 | **SKCK** | Surat Keterangan Catatan Kepolisian |

### 13.5 Jenjang Persetujuan

```
Agency Request → Legal Verify → Compliance Check → Manager Coll Approve → Direktur Approve → Admin IT Create
```

---

## 14. SOP Verifikasi Akun Role Admin

### 14.1 Deskripsi Role

| Aspek | Keterangan |
|-------|------------|
| **Role** | Admin |
| **Target Pengguna** | Administrator sistem Lendana |
| **Metode Pembuatan** | Admin-Created (Internal - Approval Tertinggi) |
| **Syarat PKS** | ❌ Internal Lendana (Kontrak Kerja) |
| **Hak Akses** | Full access, user management, system configuration |

### 14.2 Prasyarat

```
┌─────────────────────────────────────────────────────────────────┐
│                 PRASYARAT PEMBUATAN AKUN ADMIN                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Karyawan internal Lendana level senior/managerial          │
│  ✅ Background check sudah dilakukan                           │
│  ✅ Sudah lulus sertifikasi keamanan sistem                    │
│  ✅ Persetujuan dari CTO dan Direktur Utama                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 14.3 Prosedur Verifikasi

| Langkah | Aktivitas | PIC | Waktu |
|---------|-----------|-----|-------|
| 1 | CTO mengajukan pembuatan akun admin | CTO | - |
| 2 | HR melakukan background check | HR | 3-5 hari |
| 3 | Compliance review | Compliance | 2 hari |
| 4 | CTO approve | CTO | 1 hari |
| 5 | Direktur Utama approve | Direktur Utama | 1 hari |
| 6 | Admin IT senior membuat akun | Admin IT Senior | 1 hari |
| 7 | Setup 2FA wajib | Admin IT | 1 hari |
| 8 | Kirim kredensial secara terpisah | Admin IT | Secure channel |
| 9 | Admin login dan setup 2FA | Admin Baru | - |
| 10 | Training keamanan sistem | IT Security | 3 hari |

### 14.4 Dokumen yang Diperlukan

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **Kontrak Kerja** | Yang sudah ditandatangani |
| 2 | **Form Pengajuan Akun** | Lampiran A |
| 3 | **Background Check Report** | Dari HR |
| 4 | **Sertifikat Keamanan** | Jika ada |
| 5 | **NDA** | Non-Disclosure Agreement |
| 6 | **SKCK** | Surat Keterangan Catatan Kepolisian |

### 14.5 Jenjang Persetujuan

```
CTO Request → HR Background Check → Compliance Review → CTO Approve → Direktur Utama Approve → Admin IT Senior Create
```

---

## 15. Matriks Persetujuan Berjenjang

### 15.1 Ringkasan Matriks Approval

| Role | Level 1 | Level 2 | Level 3 | Level 4 |
|------|---------|---------|---------|---------|
| **User** | Sistem (Auto) | - | - | - |
| **P3MI** | Sistem (Auto) | - | - | - |
| **Agent** | HR | Manager Ops | - | - |
| **Checker** | Manager QC | HR Manager | - | - |
| **Validator** | HR | Direktur Ops | - | - |
| **Bank Staff** | Legal | Direktur | - | - |
| **Insurance** | Legal | Manager Ops | Direktur | - |
| **Collector** | Legal | Compliance | Manager Coll | Direktur |
| **Admin** | HR | Compliance | CTO | Direktur Utama |

### 15.2 Diagram Jenjang Persetujuan

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIERARKI PERSETUJUAN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      ┌─────────────────┐                       │
│                      │ DIREKTUR UTAMA  │ ← Level Tertinggi     │
│                      └────────┬────────┘                       │
│                               │                                 │
│              ┌────────────────┼────────────────┐               │
│              │                │                │               │
│      ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐        │
│      │   DIREKTUR    │ │    CTO      │ │  DIREKTUR   │        │
│      │  OPERATIONS   │ │             │ │   FINANCE   │        │
│      └───────┬───────┘ └──────┬──────┘ └─────────────┘        │
│              │                │                                 │
│      ┌───────▼───────┐ ┌──────▼──────┐                        │
│      │  HEAD OF OPS  │ │ COMPLIANCE  │                        │
│      └───────┬───────┘ └──────┬──────┘                        │
│              │                │                                 │
│  ┌───────────┼───────────┬────┴────┐                          │
│  │           │           │         │                          │
│  ▼           ▼           ▼         ▼                          │
│ ┌────┐    ┌────┐     ┌────┐    ┌────┐                        │
│ │MGR │    │MGR │     │MGR │    │ HR │                        │
│ │OPS │    │ QC │     │COLL│    │MGR │                        │
│ └────┘    └────┘     └────┘    └────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 15.3 SLA Persetujuan

| Level Approval | SLA |
|----------------|-----|
| Level 1 (Manager) | 1 hari kerja |
| Level 2 (Head/Senior Manager) | 1-2 hari kerja |
| Level 3 (Direktur) | 1-2 hari kerja |
| Level 4 (Direktur Utama) | 2-3 hari kerja |

---

## 16. Dokumen Pendukung

### 16.1 Daftar Dokumen Wajib per Role

| Role | PKS | KTP | Surat Penunjukan | Background Check | NDA |
|------|-----|-----|------------------|------------------|-----|
| User | ❌ | ❌ | ❌ | ❌ | ❌ |
| P3MI | ❌ | ❌ | ❌ | ❌ | ❌ |
| Agent | ✅ | ✅ | ✅ | ❌ | ❌ |
| Checker | ❌* | ✅ | ✅ | ❌ | ✅ |
| Validator | ❌* | ✅ | ✅ | ✅ | ✅ |
| Bank Staff | ✅ | ✅ | ✅ | ❌ | ❌ |
| Insurance | ✅ | ✅ | ✅ | ❌ | ❌ |
| Collector | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ❌* | ✅ | ✅ | ✅ | ✅ |

*❌* = Internal Lendana (menggunakan Kontrak Kerja)

### 16.2 Masa Berlaku Dokumen

| Dokumen | Masa Berlaku |
|---------|--------------|
| PKS | Sesuai ketentuan dalam PKS (umumnya 1-3 tahun) |
| Surat Penunjukan | 1 tahun atau sesuai ketentuan |
| Background Check | 1 tahun |
| NDA | Selamanya (tidak ada expiry) |
| SKCK | 6 bulan |

---

## 17. Ketentuan Keamanan

### 17.1 Password Policy

| Ketentuan | Nilai |
|-----------|-------|
| Panjang minimum | 8 karakter |
| Huruf besar | Minimal 1 |
| Huruf kecil | Minimal 1 |
| Angka | Minimal 1 |
| Karakter khusus | Disarankan |
| Masa berlaku | 90 hari |
| Riwayat password | 5 password terakhir tidak boleh digunakan |

### 17.2 Two-Factor Authentication (2FA)

| Role | 2FA Wajib |
|------|-----------|
| User | ❌ Opsional |
| P3MI | ❌ Opsional |
| Agent | ✅ Wajib |
| Checker | ✅ Wajib |
| Validator | ✅ Wajib |
| Bank Staff | ✅ Wajib |
| Insurance | ✅ Wajib |
| Collector | ✅ Wajib |
| Admin | ✅ **WAJIB** |

### 17.3 Session Management

| Ketentuan | Nilai |
|-----------|-------|
| Auto logout (idle) | 10 menit |
| Session timeout | 8 jam |
| Concurrent session | 1 device per user |

### 17.4 Pencabutan Akses

Akses akan dicabut jika:

1. PKS berakhir atau dibatalkan
2. Karyawan resign/PHK
3. Pelanggaran keamanan
4. Permintaan dari mitra
5. Tidak aktif selama 90 hari

---

## 18. Lampiran

### Lampiran A: Form Pengajuan Akun

```
┌─────────────────────────────────────────────────────────────────┐
│              FORM PENGAJUAN AKUN PENGGUNA                       │
│              PT. LENDANA DIGITALINDO NUSANTARA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nomor Pengajuan: ________________  Tanggal: ________________  │
│                                                                 │
│  A. DATA PEMOHON                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Nama Lengkap    : ____________________________________  │   │
│  │ NIK             : ____________________________________  │   │
│  │ Email           : ____________________________________  │   │
│  │ No. HP          : ____________________________________  │   │
│  │ Jabatan         : ____________________________________  │   │
│  │ Perusahaan      : ____________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  B. ROLE YANG DIMINTA                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [ ] Agent      [ ] Checker     [ ] Validator            │   │
│  │ [ ] Bank Staff [ ] Insurance   [ ] Collector            │   │
│  │ [ ] Admin                                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  C. DOKUMEN TERLAMPIR                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [ ] KTP                                                  │   │
│  │ [ ] Surat Penunjukan                                     │   │
│  │ [ ] PKS (jika mitra eksternal)                          │   │
│  │ [ ] Kontrak Kerja (jika internal)                       │   │
│  │ [ ] NDA                                                  │   │
│  │ [ ] SKCK                                                 │   │
│  │ [ ] Lainnya: ________________________________________   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  D. PERSETUJUAN                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │ Diajukan oleh:          Disetujui oleh:                 │   │
│  │                                                          │   │
│  │ ___________________     ___________________              │   │
│  │ Nama:                   Nama:                            │   │
│  │ Jabatan:                Jabatan:                         │   │
│  │ Tanggal:                Tanggal:                         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Lampiran B: Checklist Verifikasi

```
┌─────────────────────────────────────────────────────────────────┐
│              CHECKLIST VERIFIKASI AKUN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nama Pemohon: ____________________  Role: __________________  │
│                                                                 │
│  VERIFIKASI DOKUMEN                                            │
│  [ ] PKS valid dan masih berlaku                               │
│  [ ] KTP asli dan masih berlaku                                │
│  [ ] Surat penunjukan resmi                                    │
│  [ ] NDA sudah ditandatangani                                  │
│  [ ] Background check clear                                    │
│                                                                 │
│  VERIFIKASI APPROVAL                                           │
│  [ ] Level 1 approved by: _____________ Date: _____________   │
│  [ ] Level 2 approved by: _____________ Date: _____________   │
│  [ ] Level 3 approved by: _____________ Date: _____________   │
│  [ ] Level 4 approved by: _____________ Date: _____________   │
│                                                                 │
│  PEMBUATAN AKUN                                                │
│  [ ] Akun dibuat di sistem                                     │
│  [ ] Role di-assign dengan benar                               │
│  [ ] 2FA di-setup (jika wajib)                                │
│  [ ] Email aktivasi dikirim                                    │
│  [ ] User sudah login pertama kali                             │
│  [ ] Password sudah diganti                                    │
│                                                                 │
│  Diverifikasi oleh: ____________________                       │
│  Tanggal: ____________________                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Lampiran C: Template Email Aktivasi

```
Subject: [LENDANA] Aktivasi Akun - {Nama User}

Yth. {Nama User},

Akun Anda di platform Lendana Financial Access telah berhasil dibuat.

Detail Akun:
- Email: {email}
- Role: {role}
- Password Sementara: {temp_password}

Silakan login di: https://lendana.co.id/login

PENTING:
1. Segera ganti password Anda setelah login pertama
2. Aktifkan Two-Factor Authentication (2FA)
3. Jangan bagikan kredensial Anda kepada siapapun

Jika ada pertanyaan, hubungi:
- Email: support@lendana.co.id
- Telp: 021-1234-5678

Terima kasih,
Tim IT Lendana
```

### Lampiran D: Log Pembuatan Akun

| No | Tanggal | Nama User | Role | PKS No | Dibuat Oleh | Approved By |
|----|---------|-----------|------|--------|-------------|-------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

---

**Dokumen ini adalah SOP resmi PT. Lendana Digitalindo Nusantara untuk Verifikasi Akun Pengguna.**

*Versi 1.0 - Januari 2025*  
*© 2025 PT. Lendana Digitalindo Nusantara. All rights reserved.*

---

**Riwayat Perubahan Dokumen:**

| Versi | Tanggal | Perubahan | Disetujui Oleh |
|-------|---------|-----------|----------------|
| 1.0 | Jan 2025 | Dokumen awal | [Nama] |

---

**Tanda Tangan Persetujuan:**

```
Disusun oleh:                    Disetujui oleh:
                                 
___________________              ___________________
Head of Operations               Direktur Utama
Tanggal:                         Tanggal:
```
