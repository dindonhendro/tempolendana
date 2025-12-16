# Standard Operating Procedure (SOP)
# Keamanan Sistem Informasi
# PT. Lendana Digitalindo Nusantara

**Nomor Dokumen:** SOP-SEC-001  
**Versi:** 1.0  
**Tanggal Efektif:** Januari 2025  
**Klasifikasi:** Internal - Keamanan

---

## Daftar Isi

1. [Tujuan](#1-tujuan)
2. [Ruang Lingkup](#2-ruang-lingkup)
3. [Definisi dan Istilah](#3-definisi-dan-istilah)
4. [Manajemen Akses](#4-manajemen-akses)
5. [Pengelolaan Password](#5-pengelolaan-password)
6. [Pengelolaan Perangkat](#6-pengelolaan-perangkat)
7. [Keamanan Sistem Informasi](#7-keamanan-sistem-informasi)
8. [Penggunaan dan Pengelolaan Antivirus](#8-penggunaan-dan-pengelolaan-antivirus)
9. [Incident Response](#9-incident-response)
10. [Audit dan Monitoring](#10-audit-dan-monitoring)
11. [Sanksi Pelanggaran](#11-sanksi-pelanggaran)
12. [Lampiran](#12-lampiran)

---

## 1. Tujuan

SOP ini bertujuan untuk:

1. Menetapkan standar keamanan sistem informasi di PT. Lendana Digitalindo Nusantara
2. Melindungi aset informasi perusahaan dari ancaman internal dan eksternal
3. Memastikan kepatuhan terhadap regulasi OJK dan standar keamanan industri
4. Menjaga kerahasiaan, integritas, dan ketersediaan data nasabah
5. Memberikan panduan pengelolaan akses, password, perangkat, dan antivirus

---

## 2. Ruang Lingkup

SOP ini berlaku untuk:

| Kategori | Keterangan |
|----------|------------|
| **Pengguna** | Seluruh karyawan, kontraktor, dan mitra yang mengakses sistem Lendana |
| **Sistem** | Seluruh sistem informasi, aplikasi, dan infrastruktur IT Lendana |
| **Perangkat** | Komputer, laptop, smartphone, dan perangkat lain yang terhubung ke sistem |
| **Data** | Seluruh data perusahaan dan data nasabah |

---

## 3. Definisi dan Istilah

| Istilah | Definisi |
|---------|----------|
| **CIA** | Confidentiality, Integrity, Availability |
| **MFA/2FA** | Multi-Factor Authentication / Two-Factor Authentication |
| **RBAC** | Role-Based Access Control |
| **SOD** | Segregation of Duties (Pemisahan Tugas) |
| **PII** | Personally Identifiable Information |
| **Malware** | Malicious Software (virus, trojan, ransomware, dll) |
| **Endpoint** | Perangkat pengguna akhir (laptop, PC, smartphone) |
| **VPN** | Virtual Private Network |
| **SIEM** | Security Information and Event Management |

---

## 4. Manajemen Akses

### 4.1 Prinsip Dasar Manajemen Akses

```
┌─────────────────────────────────────────────────────────────────┐
│              PRINSIP MANAJEMEN AKSES LENDANA                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. LEAST PRIVILEGE (Hak Akses Minimum)                  │   │
│  │    Pengguna hanya diberikan akses yang diperlukan       │   │
│  │    untuk menjalankan tugasnya                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. NEED TO KNOW (Perlu Mengetahui)                      │   │
│  │    Akses ke informasi sensitif hanya diberikan          │   │
│  │    kepada yang membutuhkan untuk pekerjaannya           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. SEGREGATION OF DUTIES (Pemisahan Tugas)              │   │
│  │    Tugas kritis dipisahkan untuk mencegah fraud         │   │
│  │    Contoh: Yang input ≠ yang approve                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. DEFENSE IN DEPTH (Pertahanan Berlapis)               │   │
│  │    Multiple layer keamanan untuk proteksi maksimal      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Role-Based Access Control (RBAC)

#### 4.2.1 Matriks Hak Akses per Role

| Role | Dashboard | Loan Apps | User Mgmt | Reports | Settings | Audit Log |
|------|-----------|-----------|-----------|---------|----------|-----------|
| **User** | View Own | Create/View Own | ❌ | ❌ | ❌ | ❌ |
| **P3MI** | View Own | Create/View Own | ❌ | ❌ | ❌ | ❌ |
| **Agent** | View Assigned | View/Edit Assigned | ❌ | View Own | ❌ | ❌ |
| **Checker** | View All | View/Edit All | ❌ | View | ❌ | ❌ |
| **Validator** | View All | View/Validate | ❌ | View All | ❌ | View |
| **Bank Staff** | View Validated | View/Approve | ❌ | View Bank | ❌ | View |
| **Insurance** | View Approved | View/Process | ❌ | View | ❌ | ❌ |
| **Collector** | View Disbursed | View/Update | ❌ | View | ❌ | ❌ |
| **Admin** | Full | Full | Full | Full | Full | Full |

#### 4.2.2 Pembatasan Akses Data Sensitif

| Data Sensitif | User | Agent | Checker | Validator | Bank | Admin |
|---------------|------|-------|---------|-----------|------|-------|
| NIK/KTP | Own | Assigned | All | All | Validated | All |
| Rekening Bank | Own | ❌ | All | All | All | All |
| Gaji/Penghasilan | Own | Assigned | All | All | All | All |
| Foto KTP | Own | Assigned | All | All | Validated | All |
| Data Keluarga | Own | Assigned | All | All | ❌ | All |

### 4.3 Prosedur Pemberian Akses

```
┌─────────────────────────────────────────────────────────────────┐
│              ALUR PEMBERIAN AKSES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │   START     │                                               │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. PENGAJUAN AKSES                                      │   │
│  │    - User/Atasan mengisi Form Pengajuan Akses           │   │
│  │    - Menyebutkan sistem dan level akses yang diminta    │   │
│  │    - Melampirkan justifikasi bisnis                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. PERSETUJUAN ATASAN LANGSUNG                          │   │
│  │    - Review kebutuhan akses                             │   │
│  │    - Verifikasi kesesuaian dengan job description       │   │
│  │    - Approve/Reject dengan alasan                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. REVIEW IT SECURITY                                   │   │
│  │    - Cek compliance dengan kebijakan keamanan           │   │
│  │    - Verifikasi tidak ada conflict of interest          │   │
│  │    - Cek SOD (Segregation of Duties)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. IMPLEMENTASI AKSES                                   │   │
│  │    - Admin IT membuat/update akses                      │   │
│  │    - Konfigurasi role dan permission                    │   │
│  │    - Dokumentasi di sistem                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 5. NOTIFIKASI & AKTIVASI                                │   │
│  │    - Kirim notifikasi ke user                           │   │
│  │    - User aktivasi dan test akses                       │   │
│  │    - Konfirmasi akses berfungsi                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │    END      │                                               │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Prosedur Pencabutan Akses

| Kondisi | Waktu Pencabutan | PIC |
|---------|------------------|-----|
| Resign/PHK | Hari terakhir kerja | HR + IT |
| Mutasi/Rotasi | Hari efektif mutasi | HR + IT |
| Cuti panjang (>30 hari) | Hari pertama cuti | HR + IT |
| Pelanggaran keamanan | Segera (< 1 jam) | IT Security |
| PKS berakhir (mitra) | Tanggal berakhir PKS | Legal + IT |
| Tidak aktif 90 hari | Otomatis | Sistem |

### 4.5 Review Akses Berkala

| Jenis Review | Frekuensi | PIC | Output |
|--------------|-----------|-----|--------|
| User Access Review | Bulanan | IT Security | Laporan akses aktif |
| Privileged Access Review | Mingguan | IT Security | Laporan admin access |
| Dormant Account Review | Bulanan | IT | Daftar akun tidak aktif |
| SOD Conflict Review | Kuartalan | Compliance | Laporan conflict |
| Full Access Audit | Tahunan | Internal Audit | Audit report |

### 4.6 Segregation of Duties (SOD)

#### 4.6.1 Matriks SOD - Kombinasi Role yang Dilarang

| Role A | Role B | Status | Alasan |
|--------|--------|--------|--------|
| Agent | Validator | ❌ DILARANG | Yang input tidak boleh validate |
| Checker | Validator | ❌ DILARANG | Yang QC tidak boleh final approve |
| Agent | Bank Staff | ❌ DILARANG | Conflict of interest |
| Admin | Validator | ⚠️ TERBATAS | Hanya untuk emergency |
| Collector | Agent | ❌ DILARANG | Conflict of interest |

#### 4.6.2 Workflow dengan SOD

```
┌─────────────────────────────────────────────────────────────────┐
│              WORKFLOW DENGAN SEGREGATION OF DUTIES              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Submit                                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐                                               │
│  │   AGENT     │ ← Input & Review awal                         │
│  │  (Person A) │   TIDAK BOLEH validate                        │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   CHECKER   │ ← Quality Control                             │
│  │  (Person B) │   TIDAK BOLEH validate                        │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │  VALIDATOR  │ ← Final Validation                            │
│  │  (Person C) │   BERBEDA dari Agent & Checker                │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │ BANK STAFF  │ ← Bank Approval                               │
│  │  (Person D) │   EKSTERNAL (Bank Mitra)                      │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Pengelolaan Password

### 5.1 Kebijakan Password

#### 5.1.1 Standar Kompleksitas Password

| Kriteria | Requirement | Contoh |
|----------|-------------|--------|
| **Panjang Minimum** | 12 karakter | ✅ `MyP@ssw0rd123` |
| **Huruf Besar** | Minimal 1 | ✅ `M`, `P` |
| **Huruf Kecil** | Minimal 1 | ✅ `y`, `ssw`, `rd` |
| **Angka** | Minimal 1 | ✅ `0`, `1`, `2`, `3` |
| **Karakter Khusus** | Minimal 1 | ✅ `@` |
| **Tidak Boleh** | Username, nama, tanggal lahir | ❌ `john123`, `lendana2025` |

#### 5.1.2 Password Strength Meter

```
┌─────────────────────────────────────────────────────────────────┐
│              PASSWORD STRENGTH INDICATOR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WEAK (Lemah)        ████░░░░░░░░░░░░░░░░  < 8 karakter        │
│  FAIR (Cukup)        ████████░░░░░░░░░░░░  8-11 karakter       │
│  GOOD (Baik)         ████████████░░░░░░░░  12-15 karakter      │
│  STRONG (Kuat)       ████████████████░░░░  16-19 karakter      │
│  EXCELLENT           ████████████████████  20+ karakter        │
│                                                                 │
│  MINIMUM REQUIRED: GOOD (12 karakter)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Masa Berlaku Password

| Role | Masa Berlaku | Grace Period | Notifikasi |
|------|--------------|--------------|------------|
| User/P3MI | 180 hari | 14 hari | 30, 14, 7, 1 hari sebelum |
| Agent | 90 hari | 7 hari | 14, 7, 3, 1 hari sebelum |
| Checker | 90 hari | 7 hari | 14, 7, 3, 1 hari sebelum |
| Validator | 60 hari | 7 hari | 14, 7, 3, 1 hari sebelum |
| Bank Staff | 90 hari | 7 hari | 14, 7, 3, 1 hari sebelum |
| Admin | 30 hari | 3 hari | 7, 3, 1 hari sebelum |

### 5.3 Password History

| Ketentuan | Nilai |
|-----------|-------|
| Jumlah password yang tidak boleh diulang | 12 password terakhir |
| Minimum waktu sebelum bisa ganti password | 24 jam |
| Maximum percobaan login gagal | 5 kali |
| Durasi lockout setelah gagal | 30 menit |

### 5.4 Prosedur Reset Password

```
┌─────────────────────────────────────────────────────────────────┐
│              PROSEDUR RESET PASSWORD                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  A. SELF-SERVICE RESET (User/P3MI)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Klik "Lupa Password" di halaman login                │   │
│  │ 2. Masukkan email terdaftar                             │   │
│  │ 3. Sistem kirim link reset (valid 1 jam)                │   │
│  │ 4. Klik link dan buat password baru                     │   │
│  │ 5. Login dengan password baru                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  B. ADMIN-ASSISTED RESET (Internal/Mitra)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. User menghubungi IT Helpdesk                         │   │
│  │ 2. Verifikasi identitas (KTP, Employee ID, dll)         │   │
│  │ 3. IT generate temporary password                       │   │
│  │ 4. Kirim via channel terpisah (SMS/WhatsApp)            │   │
│  │ 5. User login dan WAJIB ganti password                  │   │
│  │ 6. Catat di log reset password                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  C. EMERGENCY RESET (Admin Account)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Request ke CTO dengan justifikasi                    │   │
│  │ 2. CTO approve via email/ticket                         │   │
│  │ 3. IT Security generate temporary password              │   │
│  │ 4. Kirim via secure channel (encrypted)                 │   │
│  │ 5. Admin login dan ganti password + reset 2FA           │   │
│  │ 6. Dokumentasi lengkap di incident log                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Two-Factor Authentication (2FA)

#### 5.5.1 Metode 2FA yang Didukung

| Metode | Prioritas | Keterangan |
|--------|-----------|------------|
| **Authenticator App** | ⭐⭐⭐ Utama | Google Authenticator, Authy |
| **SMS OTP** | ⭐⭐ Backup | Untuk recovery |
| **Email OTP** | ⭐ Emergency | Hanya jika metode lain gagal |

#### 5.5.2 Kewajiban 2FA per Role

| Role | 2FA Wajib | Metode Minimum |
|------|-----------|----------------|
| User | ❌ Opsional | - |
| P3MI | ❌ Opsional | - |
| Agent | ✅ Wajib | Authenticator App |
| Checker | ✅ Wajib | Authenticator App |
| Validator | ✅ Wajib | Authenticator App |
| Bank Staff | ✅ Wajib | Authenticator App |
| Insurance | ✅ Wajib | Authenticator App |
| Collector | ✅ Wajib | Authenticator App |
| Admin | ✅ **WAJIB** | Authenticator App + Backup |

### 5.6 Larangan Terkait Password

```
┌─────────────────────────────────────────────────────────────────┐
│              LARANGAN TERKAIT PASSWORD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❌ DILARANG:                                                   │
│                                                                 │
│  • Membagikan password kepada siapapun (termasuk atasan)       │
│  • Menuliskan password di kertas/sticky note                   │
│  • Menyimpan password di file teks/spreadsheet                 │
│  • Menggunakan password yang sama untuk sistem berbeda         │
│  • Mengirim password via email/chat tanpa enkripsi             │
│  • Menggunakan fitur "Remember Password" di browser publik     │
│  • Menggunakan password yang mudah ditebak                     │
│  • Membiarkan orang lain melihat saat mengetik password        │
│                                                                 │
│  ✅ DIANJURKAN:                                                 │
│                                                                 │
│  • Gunakan Password Manager (1Password, Bitwarden, dll)        │
│  • Gunakan passphrase yang panjang dan mudah diingat           │
│  • Aktifkan 2FA untuk semua akun                               │
│  • Ganti password segera jika dicurigai bocor                  │
│  • Gunakan password unik untuk setiap sistem                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.7 Password untuk Service Account

| Jenis Account | Panjang Min | Rotasi | Penyimpanan |
|---------------|-------------|--------|-------------|
| Database | 32 karakter | 90 hari | Vault/Secret Manager |
| API Key | 64 karakter | 180 hari | Environment Variable |
| Service Account | 24 karakter | 90 hari | Vault/Secret Manager |
| Encryption Key | 256 bit | Tahunan | HSM/KMS |

---

## 6. Pengelolaan Perangkat

### 6.1 Klasifikasi Perangkat

```
┌─────────────────────────────────────────────────────────────────┐
│              KLASIFIKASI PERANGKAT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PERANGKAT PERUSAHAAN (Company-Owned)                    │   │
│  │                                                          │   │
│  │ • Laptop/PC kantor                                      │   │
│  │ • Smartphone kantor                                     │   │
│  │ • Server dan infrastruktur                              │   │
│  │ • Perangkat jaringan (router, switch, firewall)         │   │
│  │                                                          │   │
│  │ → Full control oleh IT                                  │   │
│  │ → Wajib comply dengan semua kebijakan                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PERANGKAT PRIBADI (BYOD - Bring Your Own Device)        │   │
│  │                                                          │   │
│  │ • Laptop pribadi karyawan                               │   │
│  │ • Smartphone pribadi                                    │   │
│  │ • Tablet pribadi                                        │   │
│  │                                                          │   │
│  │ → Harus terdaftar di IT                                 │   │
│  │ → Wajib install MDM (Mobile Device Management)          │   │
│  │ → Akses terbatas ke sistem tertentu                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PERANGKAT MITRA (Partner Device)                        │   │
│  │                                                          │   │
│  │ • Perangkat bank mitra                                  │   │
│  │ • Perangkat asuransi mitra                              │   │
│  │ • Perangkat agent eksternal                             │   │
│  │                                                          │   │
│  │ → Akses via VPN atau web portal                         │   │
│  │ → Tidak ada kontrol langsung                            │   │
│  │ → Monitoring aktivitas ketat                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Standar Keamanan Perangkat

#### 6.2.1 Laptop/PC

| Komponen | Standar Minimum |
|----------|-----------------|
| **Operating System** | Windows 10/11 Pro, macOS 12+, Ubuntu 22.04 LTS |
| **Antivirus** | Wajib terinstall dan aktif (lihat Section 8) |
| **Firewall** | Wajib aktif |
| **Disk Encryption** | BitLocker (Windows), FileVault (macOS), LUKS (Linux) |
| **Auto-lock** | Maksimal 5 menit idle |
| **Password Login** | Wajib, sesuai kebijakan password |
| **Auto-update** | Wajib aktif untuk OS dan aplikasi |
| **USB Port** | Terbatas (hanya untuk perangkat terdaftar) |

#### 6.2.2 Smartphone/Tablet

| Komponen | Standar Minimum |
|----------|-----------------|
| **Operating System** | iOS 15+, Android 12+ |
| **Screen Lock** | PIN 6 digit / Biometric |
| **Encryption** | Wajib aktif |
| **MDM** | Wajib terinstall untuk akses sistem |
| **Remote Wipe** | Wajib diaktifkan |
| **Jailbreak/Root** | ❌ DILARANG |

### 6.3 Prosedur Pendaftaran Perangkat

```
┌─────────────────────────────────────────────────────────────────┐
│              PROSEDUR PENDAFTARAN PERANGKAT                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PENGAJUAN                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Isi Form Pendaftaran Perangkat (Lampiran A)           │   │
│  │ • Sertakan informasi: Merk, Model, Serial Number        │   │
│  │ • Tanda tangan persetujuan kebijakan BYOD               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  2. VERIFIKASI IT                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • IT cek spesifikasi perangkat                          │   │
│  │ • Scan malware/virus                                    │   │
│  │ • Verifikasi OS dan patch level                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  3. KONFIGURASI                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Install MDM agent                                     │   │
│  │ • Konfigurasi security policy                           │   │
│  │ • Install antivirus (jika belum)                        │   │
│  │ • Setup VPN profile                                     │   │
│  │ • Enable disk encryption                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  4. AKTIVASI                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Daftarkan di inventory sistem                         │   │
│  │ • Berikan akses sesuai role                             │   │
│  │ • Kirim konfirmasi ke user                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Pengelolaan Perangkat Hilang/Dicuri

| Langkah | Aktivitas | PIC | SLA |
|---------|-----------|-----|-----|
| 1 | User lapor ke IT Helpdesk | User | Segera |
| 2 | IT verifikasi kepemilikan | IT | 15 menit |
| 3 | Remote lock perangkat | IT Security | 30 menit |
| 4 | Remote wipe data (jika perlu) | IT Security | 1 jam |
| 5 | Revoke semua akses dari perangkat | IT Security | 1 jam |
| 6 | Reset password user | IT | 1 jam |
| 7 | Lapor ke polisi (jika dicuri) | User + HR | 24 jam |
| 8 | Dokumentasi insiden | IT Security | 24 jam |

### 6.5 Disposal Perangkat

```
┌─────────────────────────────────────────────────────────────────┐
│              PROSEDUR DISPOSAL PERANGKAT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. BACKUP DATA                                                │
│     • Backup semua data penting ke server                      │
│     • Verifikasi backup berhasil                               │
│                                                                 │
│  2. DATA SANITIZATION                                          │
│     • Wipe data menggunakan tool certified                     │
│     • Minimum 3-pass overwrite untuk HDD                       │
│     • Secure erase untuk SSD                                   │
│     • Dokumentasi proses wipe                                  │
│                                                                 │
│  3. PHYSICAL DESTRUCTION (untuk media sensitif)                │
│     • Shredding untuk HDD/SSD dengan data sangat sensitif      │
│     • Gunakan vendor certified                                 │
│     • Dapatkan Certificate of Destruction                      │
│                                                                 │
│  4. DEREGISTRASI                                               │
│     • Hapus dari inventory                                     │
│     • Hapus dari MDM                                           │
│     • Update asset register                                    │
│                                                                 │
│  5. DISPOSAL                                                   │
│     • Jual/donasi (jika masih layak)                          │
│     • Recycle via vendor certified                             │
│     • Dokumentasi disposal                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.6 Larangan Penggunaan Perangkat

| Larangan | Alasan |
|----------|--------|
| Menggunakan perangkat tidak terdaftar untuk akses sistem | Risiko keamanan |
| Menginstall software bajakan | Legal dan security risk |
| Menonaktifkan antivirus/firewall | Risiko malware |
| Menyimpan data perusahaan di cloud pribadi | Data leakage |
| Meminjamkan perangkat ke orang lain | Unauthorized access |
| Menggunakan WiFi publik tanpa VPN | Man-in-the-middle attack |
| Menghubungkan USB tidak dikenal | Malware risk |

---

## 7. Keamanan Sistem Informasi

### 7.1 Arsitektur Keamanan

```
┌─────────────────────────────────────────────────────────────────┐
│              ARSITEKTUR KEAMANAN LENDANA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INTERNET                                                       │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    WAF (Web Application Firewall)        │   │
│  │                    DDoS Protection                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    LOAD BALANCER                         │   │
│  │                    SSL/TLS Termination                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DMZ (Demilitarized Zone)              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ Web Server  │  │ API Gateway │  │ Auth Server │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    INTERNAL FIREWALL                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    INTERNAL NETWORK                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ App Server  │  │  Database   │  │   Storage   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Standar Enkripsi

| Data State | Metode Enkripsi | Standar |
|------------|-----------------|---------|
| **Data at Rest** | AES-256 | Database, Storage, Backup |
| **Data in Transit** | TLS 1.3 | HTTPS, API calls |
| **Data in Use** | Application-level | Sensitive fields |
| **Backup** | AES-256 + Key rotation | Offsite backup |
| **Password** | bcrypt (cost 12) | User passwords |
| **API Keys** | SHA-256 | Service authentication |

### 7.3 Network Security

#### 7.3.1 Firewall Rules

| Source | Destination | Port | Protocol | Action |
|--------|-------------|------|----------|--------|
| Internet | WAF | 443 | HTTPS | Allow |
| WAF | Web Server | 8080 | HTTP | Allow |
| Web Server | API Gateway | 3000 | HTTP | Allow |
| API Gateway | Database | 5432 | PostgreSQL | Allow |
| Internal | All | All | All | Allow (with logging) |
| All | All | All | All | Deny (default) |

#### 7.3.2 VPN Policy

| Aspek | Ketentuan |
|-------|-----------|
| **Protokol** | WireGuard / OpenVPN |
| **Enkripsi** | AES-256-GCM |
| **Authentication** | Certificate + 2FA |
| **Split Tunneling** | Disabled |
| **Session Timeout** | 8 jam |
| **Concurrent Sessions** | 1 per user |

### 7.4 Application Security

#### 7.4.1 Secure Development Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│              SECURE DEVELOPMENT LIFECYCLE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │  PLANNING   │ → Security requirements                       │
│  └──────┬──────┘   Threat modeling                             │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   DESIGN    │ → Security architecture review                │
│  └──────┬──────┘   Attack surface analysis                     │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   DEVELOP   │ → Secure coding standards                     │
│  └──────┬──────┘   Code review                                 │
│         │          SAST (Static Analysis)                      │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   TESTING   │ → DAST (Dynamic Analysis)                     │
│  └──────┬──────┘   Penetration testing                         │
│         │          Vulnerability assessment                    │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   DEPLOY    │ → Security configuration                      │
│  └──────┬──────┘   Hardening                                   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │  MAINTAIN   │ → Patch management                            │
│  └─────────────┘   Continuous monitoring                       │
│                    Incident response                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.4.2 OWASP Top 10 Mitigation

| Vulnerability | Mitigation |
|---------------|------------|
| **Injection** | Parameterized queries, input validation |
| **Broken Authentication** | MFA, session management, password policy |
| **Sensitive Data Exposure** | Encryption, masking, access control |
| **XML External Entities** | Disable DTD, use JSON |
| **Broken Access Control** | RBAC, least privilege |
| **Security Misconfiguration** | Hardening, automated scanning |
| **XSS** | Output encoding, CSP headers |
| **Insecure Deserialization** | Input validation, integrity checks |
| **Using Components with Vulnerabilities** | Dependency scanning, patching |
| **Insufficient Logging** | Centralized logging, SIEM |

### 7.5 Database Security

| Aspek | Implementasi |
|-------|--------------|
| **Access Control** | Role-based, least privilege |
| **Encryption** | TDE (Transparent Data Encryption) |
| **Audit Logging** | All queries logged |
| **Backup** | Daily encrypted backup |
| **Connection** | SSL/TLS required |
| **Firewall** | Only from app servers |
| **Sensitive Data** | Column-level encryption |

### 7.6 Backup dan Recovery

#### 7.6.1 Backup Schedule

| Data Type | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| Database | Hourly | 7 hari | Primary DC |
| Database | Daily | 30 hari | Secondary DC |
| Database | Weekly | 1 tahun | Offsite |
| Files/Documents | Daily | 30 hari | Cloud Storage |
| System Config | Weekly | 90 hari | Version Control |
| Logs | Daily | 1 tahun | SIEM |

#### 7.6.2 Recovery Time Objective (RTO) & Recovery Point Objective (RPO)

| System | RTO | RPO |
|--------|-----|-----|
| Core Banking Integration | 1 jam | 15 menit |
| Loan Application System | 4 jam | 1 jam |
| User Portal | 8 jam | 4 jam |
| Reporting System | 24 jam | 24 jam |

### 7.7 Patch Management

```
┌─────────────────────────────────────────────────────────────────┐
│              PATCH MANAGEMENT PROCESS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. IDENTIFICATION                                             │
│     • Monitor vendor advisories                                │
│     • Subscribe to security bulletins                          │
│     • Vulnerability scanning                                   │
│                                                                 │
│  2. ASSESSMENT                                                 │
│     • Evaluate severity (CVSS score)                           │
│     • Assess impact to systems                                 │
│     • Prioritize based on risk                                 │
│                                                                 │
│  3. TESTING                                                    │
│     • Test in staging environment                              │
│     • Verify functionality                                     │
│     • Check for conflicts                                      │
│                                                                 │
│  4. DEPLOYMENT                                                 │
│     • Schedule maintenance window                              │
│     • Deploy to production                                     │
│     • Monitor for issues                                       │
│                                                                 │
│  5. VERIFICATION                                               │
│     • Confirm patch applied                                    │
│     • Rescan for vulnerabilities                               │
│     • Document completion                                      │
│                                                                 │
│  TIMELINE:                                                     │
│  • Critical (CVSS 9.0+): 24-48 jam                            │
│  • High (CVSS 7.0-8.9): 7 hari                                │
│  • Medium (CVSS 4.0-6.9): 30 hari                             │
│  • Low (CVSS 0.1-3.9): 90 hari                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Penggunaan dan Pengelolaan Antivirus

### 8.1 Standar Antivirus

#### 8.1.1 Solusi Antivirus yang Disetujui

| Platform | Solusi Utama | Alternatif |
|----------|--------------|------------|
| **Windows** | Microsoft Defender for Endpoint | CrowdStrike, SentinelOne |
| **macOS** | Microsoft Defender for Endpoint | CrowdStrike, SentinelOne |
| **Linux** | ClamAV + OSSEC | CrowdStrike |
| **Server** | Microsoft Defender for Servers | CrowdStrike Falcon |
| **Mobile (Android)** | Microsoft Defender | Lookout |
| **Mobile (iOS)** | Microsoft Defender | Lookout |

#### 8.1.2 Fitur Wajib Antivirus

| Fitur | Status | Keterangan |
|-------|--------|------------|
| **Real-time Protection** | ✅ Wajib Aktif | Scan otomatis saat file diakses |
| **Scheduled Scan** | ✅ Wajib Aktif | Full scan mingguan |
| **Auto-update** | ✅ Wajib Aktif | Update definisi otomatis |
| **Cloud Protection** | ✅ Wajib Aktif | Threat intelligence |
| **Behavior Monitoring** | ✅ Wajib Aktif | Deteksi anomali |
| **Ransomware Protection** | ✅ Wajib Aktif | Folder protection |
| **Web Protection** | ✅ Wajib Aktif | Block malicious URLs |
| **Email Protection** | ✅ Wajib Aktif | Scan attachment |
| **USB Scanning** | ✅ Wajib Aktif | Scan removable media |
| **Centralized Management** | ✅ Wajib | Managed by IT |

### 8.2 Konfigurasi Antivirus

```
┌─────────────────────────────────────────────────────────────────┐
│              KONFIGURASI STANDAR ANTIVIRUS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REAL-TIME PROTECTION                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Scan all files on access: ENABLED                     │   │
│  │ • Scan network files: ENABLED                           │   │
│  │ • Scan archives: ENABLED                                │   │
│  │ • Scan removable drives: ENABLED                        │   │
│  │ • Scan email attachments: ENABLED                       │   │
│  │ • Heuristic analysis: HIGH                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SCHEDULED SCAN                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Quick scan: Daily at 12:00                            │   │
│  │ • Full scan: Weekly on Sunday at 02:00                  │   │
│  │ • Scan priority: LOW (minimize performance impact)      │   │
│  │ • Scan when idle: ENABLED                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  UPDATE SETTINGS                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Definition update: Every 4 hours                      │   │
│  │ • Engine update: Automatic                              │   │
│  │ • Cloud-delivered protection: ENABLED                   │   │
│  │ • Sample submission: Automatic                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  THREAT ACTIONS                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Severe threats: REMOVE automatically                  │   │
│  │ • High threats: QUARANTINE automatically                │   │
│  │ • Medium threats: QUARANTINE automatically              │   │
│  │ • Low threats: ALERT user                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  EXCLUSIONS (Managed by IT only)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Development folders (with approval)                   │   │
│  │ • Trusted applications (verified)                       │   │
│  │ • Performance-critical paths (documented)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Prosedur Penanganan Deteksi Malware

```
┌─────────────────────────────────────────────────────────────────┐
│              PROSEDUR PENANGANAN MALWARE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │  DETEKSI    │ ← Antivirus mendeteksi malware                │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. ISOLASI OTOMATIS                                     │   │
│  │    • Antivirus quarantine file                          │   │
│  │    • Alert ke IT Security                               │   │
│  │    • Log incident                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. NOTIFIKASI                                           │   │
│  │    • User mendapat notifikasi                           │   │
│  │    • IT Security mendapat alert                         │   │
│  │    • Ticket otomatis dibuat                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. ANALISIS                                             │   │
│  │    • IT Security analisis threat                        │   │
│  │    • Identifikasi sumber infeksi                        │   │
│  │    • Assess impact                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ├──── Low Risk ────▶ Clean & Monitor                   │
│         │                                                       │
│         ├──── Medium Risk ──▶ Full Scan + Investigation        │
│         │                                                       │
│         └──── High Risk ────▶ Isolate Device + Incident Response│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. REMEDIASI                                            │   │
│  │    • Remove malware                                     │   │
│  │    • Patch vulnerability                                │   │
│  │    • Reset credentials (if needed)                      │   │
│  │    • Restore from backup (if needed)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 5. POST-INCIDENT                                        │   │
│  │    • Document incident                                  │   │
│  │    • Update detection rules                             │   │
│  │    • User awareness (if needed)                         │   │
│  │    • Lessons learned                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Monitoring dan Reporting

#### 8.4.1 Dashboard Monitoring

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Devices with active protection | 100% | < 99% |
| Definition age | < 24 jam | > 48 jam |
| Threats detected (daily) | Baseline | > 2x baseline |
| Quarantined items | < 10 | > 50 |
| Scan completion rate | 100% | < 95% |
| False positive rate | < 1% | > 5% |

#### 8.4.2 Reporting Schedule

| Report | Frequency | Audience |
|--------|-----------|----------|
| Daily Threat Summary | Daily | IT Security |
| Weekly Security Report | Weekly | IT Manager |
| Monthly Executive Report | Monthly | Management |
| Quarterly Compliance Report | Quarterly | Compliance + OJK |
| Annual Security Review | Annually | Board + OJK |

### 8.5 Larangan Terkait Antivirus

```
┌─────────────────────────────────────────────────────────────────┐
│              LARANGAN TERKAIT ANTIVIRUS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❌ DILARANG:                                                   │
│                                                                 │
│  • Menonaktifkan antivirus tanpa izin IT                       │
│  • Menghapus atau uninstall antivirus                          │
│  • Mengabaikan alert/warning dari antivirus                    │
│  • Menambahkan exclusion tanpa approval IT                     │
│  • Menggunakan antivirus selain yang disetujui                 │
│  • Menunda update antivirus                                    │
│  • Membuka file yang di-quarantine tanpa izin IT               │
│  • Mengabaikan scheduled scan                                  │
│                                                                 │
│  ⚠️ PELANGGARAN AKAN DIKENAKAN SANKSI                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.6 Endpoint Detection and Response (EDR)

| Capability | Description |
|------------|-------------|
| **Threat Detection** | Real-time detection of advanced threats |
| **Investigation** | Forensic analysis of incidents |
| **Response** | Automated and manual response actions |
| **Hunting** | Proactive threat hunting |
| **Reporting** | Detailed incident reports |

### 8.7 Update dan Maintenance

| Task | Frequency | PIC |
|------|-----------|-----|
| Definition update | Automatic (4 jam) | System |
| Engine update | Automatic (weekly) | System |
| Policy review | Monthly | IT Security |
| Exclusion review | Quarterly | IT Security |
| Full audit | Annually | Internal Audit |

---

## 9. Incident Response

### 9.1 Klasifikasi Insiden

| Severity | Kriteria | Response Time | Escalation |
|----------|----------|---------------|------------|
| **Critical** | Data breach, ransomware, system down | 15 menit | CTO + Direktur |
| **High** | Malware outbreak, unauthorized access | 1 jam | IT Manager |
| **Medium** | Single malware, policy violation | 4 jam | IT Security |
| **Low** | False positive, minor issue | 24 jam | IT Helpdesk |

### 9.2 Incident Response Team

| Role | Responsibility |
|------|----------------|
| **Incident Commander** | Overall coordination |
| **IT Security Lead** | Technical investigation |
| **System Admin** | System recovery |
| **Communications** | Internal/external communication |
| **Legal** | Regulatory compliance |
| **HR** | Employee-related issues |

### 9.3 Incident Response Process

```
┌─────────────────────────────────────────────────────────────────┐
│              INCIDENT RESPONSE PROCESS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PREPARATION                                                │
│     • Incident response plan                                   │
│     • Team training                                            │
│     • Tools and resources                                      │
│                                                                 │
│  2. IDENTIFICATION                                             │
│     • Detect incident                                          │
│     • Classify severity                                        │
│     • Initial assessment                                       │
│                                                                 │
│  3. CONTAINMENT                                                │
│     • Short-term: Stop the bleeding                            │
│     • Long-term: Prevent spread                                │
│     • Evidence preservation                                    │
│                                                                 │
│  4. ERADICATION                                                │
│     • Remove threat                                            │
│     • Patch vulnerabilities                                    │
│     • Strengthen defenses                                      │
│                                                                 │
│  5. RECOVERY                                                   │
│     • Restore systems                                          │
│     • Verify functionality                                     │
│     • Monitor for recurrence                                   │
│                                                                 │
│  6. LESSONS LEARNED                                            │
│     • Post-incident review                                     │
│     • Update procedures                                        │
│     • Improve defenses                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Pelaporan Insiden ke OJK

| Jenis Insiden | Waktu Pelaporan | Format |
|---------------|-----------------|--------|
| Data breach (> 1000 nasabah) | 24 jam | Form OJK |
| System down (> 4 jam) | 24 jam | Form OJK |
| Fraud/Cyber attack | 24 jam | Form OJK |
| Minor incident | Laporan bulanan | Summary |

---

## 10. Audit dan Monitoring

### 10.1 Log Management

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Authentication logs | 2 tahun | SIEM |
| Access logs | 1 tahun | SIEM |
| Application logs | 1 tahun | SIEM |
| Security events | 2 tahun | SIEM |
| Audit trail | 5 tahun | Archive |

### 10.2 Monitoring Metrics

| Category | Metrics |
|----------|---------|
| **Access** | Failed logins, privilege escalation, unusual access patterns |
| **Network** | Traffic anomalies, blocked connections, VPN usage |
| **Endpoint** | Malware detections, policy violations, patch status |
| **Application** | Error rates, response times, security events |
| **Data** | Data access patterns, export activities, sensitive data access |

### 10.3 Security Audit Schedule

| Audit Type | Frequency | Auditor |
|------------|-----------|---------|
| Access review | Monthly | IT Security |
| Vulnerability assessment | Quarterly | IT Security |
| Penetration testing | Annually | External |
| Compliance audit | Annually | Internal Audit |
| OJK audit | As required | OJK |

---

## 11. Sanksi Pelanggaran

### 11.1 Kategori Pelanggaran

| Kategori | Contoh | Sanksi |
|----------|--------|--------|
| **Ringan** | Lupa lock screen, password lemah | Peringatan lisan |
| **Sedang** | Share password, disable antivirus | Peringatan tertulis |
| **Berat** | Data breach, unauthorized access | SP1-SP3 |
| **Sangat Berat** | Fraud, sabotage | PHK + Proses hukum |

### 11.2 Proses Penanganan Pelanggaran

```
Deteksi → Investigasi → Dokumentasi → Hearing → Sanksi → Monitoring
```

---

## 12. Lampiran

### Lampiran A: Form Pendaftaran Perangkat

```
┌─────────────────────────────────────────────────────────────────┐
│              FORM PENDAFTARAN PERANGKAT                         │
│              PT. LENDANA DIGITALINDO NUSANTARA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nomor Registrasi: ________________  Tanggal: ________________  │
│                                                                 │
│  A. DATA PEMILIK                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Nama Lengkap    : ____________________________________  │   │
│  │ NIK/Employee ID : ____________________________________  │   │
│  │ Departemen      : ____________________________________  │   │
│  │ Email           : ____________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  B. DATA PERANGKAT                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Jenis Perangkat : [ ] Laptop  [ ] PC  [ ] Smartphone    │   │
│  │ Merk/Model      : ____________________________________  │   │
│  │ Serial Number   : ____________________________________  │   │
│  │ MAC Address     : ____________________________________  │   │
│  │ Operating System: ____________________________________  │   │
│  │ Kepemilikan     : [ ] Perusahaan  [ ] Pribadi (BYOD)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  C. PERNYATAAN                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Saya menyatakan bahwa:                                  │   │
│  │ [ ] Telah membaca dan memahami kebijakan keamanan       │   │
│  │ [ ] Bersedia mematuhi semua ketentuan                   │   │
│  │ [ ] Bersedia install MDM dan antivirus                  │   │
│  │ [ ] Bersedia perangkat di-wipe jika hilang/dicuri       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Tanda Tangan: ____________________  Tanggal: ______________   │
│                                                                 │
│  VERIFIKASI IT                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [ ] Spesifikasi memenuhi standar                        │   │
│  │ [ ] Antivirus terinstall                                │   │
│  │ [ ] MDM terinstall                                      │   │
│  │ [ ] Encryption aktif                                    │   │
│  │ [ ] Terdaftar di inventory                              │   │
│  │                                                          │   │
│  │ Diverifikasi oleh: ________________  Tanggal: ________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Lampiran B: Form Pengajuan Akses

```
┌─────────────────────────────────────────────────────────────────┐
│              FORM PENGAJUAN AKSES SISTEM                        │
│              PT. LENDANA DIGITALINDO NUSANTARA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nomor Pengajuan: ________________  Tanggal: ________________   │
│                                                                 │
│  A. DATA PEMOHON                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Nama Lengkap    : ____________________________________  │   │
│  │ Employee ID     : ____________________________________  │   │
│  │ Departemen      : ____________________________________  │   │
│  │ Jabatan         : ____________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  B. AKSES YANG DIMINTA                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Sistem          : ____________________________________  │   │
│  │ Role/Level      : ____________________________________  │   │
│  │ Justifikasi     : ____________________________________  │   │
│  │                   ____________________________________  │   │
│  │ Durasi          : [ ] Permanen  [ ] Sementara: ______  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  C. PERSETUJUAN                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │ Atasan Langsung:                                        │   │
│  │ Nama: ________________  TTD: ________  Tgl: __________  │   │
│  │                                                          │   │
│  │ IT Security:                                            │   │
│  │ Nama: ________________  TTD: ________  Tgl: __________  │   │
│  │                                                          │   │
│  │ IT Admin (Implementasi):                                │   │
│  │ Nama: ________________  TTD: ________  Tgl: __________  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Lampiran C: Checklist Keamanan Perangkat

```
┌─────────────────────────────────────────────────────────────────┐
│              CHECKLIST KEAMANAN PERANGKAT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Device ID: ________________  User: ________________            │
│  Date: ________________                                         │
│                                                                 │
│  OPERATING SYSTEM                                              │
│  [ ] OS version up to date                                     │
│  [ ] All security patches applied                              │
│  [ ] Auto-update enabled                                       │
│                                                                 │
│  ANTIVIRUS                                                     │
│  [ ] Antivirus installed and active                            │
│  [ ] Real-time protection enabled                              │
│  [ ] Definitions up to date                                    │
│  [ ] Last full scan: ________________                          │
│                                                                 │
│  ENCRYPTION                                                    │
│  [ ] Disk encryption enabled                                   │
│  [ ] Recovery key backed up                                    │
│                                                                 │
│  ACCESS CONTROL                                                │
│  [ ] Strong password set                                       │
│  [ ] Auto-lock enabled (max 5 min)                            │
│  [ ] 2FA configured (if required)                              │
│                                                                 │
│  NETWORK                                                       │
│  [ ] Firewall enabled                                          │
│  [ ] VPN configured                                            │
│  [ ] No unauthorized software                                  │
│                                                                 │
│  MDM (Mobile Device Management)                                │
│  [ ] MDM agent installed                                       │
│  [ ] Remote wipe enabled                                       │
│  [ ] Compliance status: COMPLIANT                              │
│                                                                 │
│  Verified by: ________________  Date: ________________         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Lampiran D: Template Incident Report

```
┌─────────────────────────────────────────────────────────────────┐
│              SECURITY INCIDENT REPORT                           │
│              PT. LENDANA DIGITALINDO NUSANTARA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Incident ID: ________________  Date: ________________          │
│  Severity: [ ] Critical  [ ] High  [ ] Medium  [ ] Low         │
│                                                                 │
│  A. INCIDENT SUMMARY                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Type: ________________________________________________  │   │
│  │ Description: _________________________________________  │   │
│  │ ______________________________________________________  │   │
│  │ Affected Systems: ____________________________________  │   │
│  │ Affected Users: ______________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  B. TIMELINE                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Detected: ____________________________________________  │   │
│  │ Reported: ____________________________________________  │   │
│  │ Contained: ___________________________________________  │   │
│  │ Resolved: ____________________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  C. ROOT CAUSE                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ______________________________________________________  │   │
│  │ ______________________________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  D. ACTIONS TAKEN                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ______________________________________________________  │   │
│  │ ______________________________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  E. RECOMMENDATIONS                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ______________________________________________________  │   │
│  │ ______________________________________________________  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Prepared by: ________________  Date: ________________         │
│  Reviewed by: ________________  Date: ________________         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Dokumen ini adalah SOP resmi PT. Lendana Digitalindo Nusantara untuk Keamanan Sistem Informasi.**

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
IT Security Manager              Chief Technology Officer

___________________              ___________________
Compliance Officer               Direktur Utama

Tanggal:                         Tanggal:
```
