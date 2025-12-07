# Product Requirements Document (PRD)
# Lendana Financial Access Platform

**Versi:** 1.0  
**Tanggal:** Januari 2025  
**Status:** Active Development  
**Pemilik Produk:** PT. Lendana Digitalindo Nusantara

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Latar Belakang & Masalah](#2-latar-belakang--masalah)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Target Pengguna](#4-target-pengguna)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Fitur Utama](#6-fitur-utama)
7. [User Stories](#7-user-stories)
8. [Workflow & Business Process](#8-workflow--business-process)
9. [Technical Requirements](#9-technical-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [Success Metrics](#12-success-metrics)
13. [Timeline & Milestones](#13-timeline--milestones)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

**Lendana Financial Access Platform** adalah platform agregator teknologi finansial yang terdaftar di OJK (Otoritas Jasa Keuangan) Indonesia. Platform ini bertujuan untuk menghubungkan masyarakat dengan layanan keuangan dan penyaluran KUR (Kredit Usaha Rakyat) melalui bank-bank mitra.

### Visi
Menjadi platform agregator finansial terdepan yang memberikan akses keuangan inklusif kepada seluruh lapisan masyarakat Indonesia.

### Misi
- Menyediakan akses mudah ke layanan kredit untuk berbagai segmen masyarakat
- Menghubungkan peminjam dengan bank mitra secara efisien
- Memastikan proses pengajuan kredit yang transparan dan cepat
- Mematuhi regulasi OJK dan standar keamanan data

---

## 2. Latar Belakang & Masalah

### Masalah yang Dihadapi

| No | Masalah | Dampak |
|----|---------|--------|
| 1 | Akses kredit sulit bagi masyarakat pedesaan | Pertumbuhan ekonomi terhambat |
| 2 | Proses pengajuan kredit manual dan lambat | Waktu approval lama (minggu-bulan) |
| 3 | Kurangnya transparansi status pengajuan | Ketidakpastian bagi peminjam |
| 4 | Dokumentasi fisik rentan hilang/rusak | Risiko operasional tinggi |
| 5 | Tidak ada sistem tracking terpusat | Kesulitan monitoring dan audit |

### Solusi yang Ditawarkan

Platform digital terintegrasi yang:
- Mendigitalisasi seluruh proses pengajuan kredit
- Menyediakan tracking real-time status aplikasi
- Menghubungkan semua stakeholder dalam satu sistem
- Memastikan keamanan dan compliance data

---

## 3. Tujuan Produk

### Tujuan Bisnis

1. **Meningkatkan inklusi keuangan** - Menjangkau 100,000+ pengguna dalam 2 tahun
2. **Mempercepat proses kredit** - Mengurangi waktu approval dari minggu menjadi hari
3. **Meningkatkan approval rate** - Target 70% approval rate untuk aplikasi yang memenuhi syarat
4. **Compliance OJK** - 100% kepatuhan terhadap regulasi

### Tujuan Teknis

1. **Uptime 99.9%** - Ketersediaan sistem tinggi
2. **Response time < 2 detik** - Performa optimal
3. **Zero data breach** - Keamanan data terjamin
4. **Mobile-first design** - Aksesibilitas dari berbagai device

---

## 4. Target Pengguna

### Segmen Utama

| Segmen | Deskripsi | Kebutuhan Utama |
|--------|-----------|-----------------|
| **PMI (Pekerja Migran Indonesia)** | TKI yang membutuhkan modal sebelum berangkat | Pinjaman cepat, proses mudah |
| **Peternak** | Peternak yang butuh modal usaha | Kredit dengan tenor fleksibel |
| **Petani/Nelayan** | Petani dan nelayan untuk modal kerja | Bunga rendah, jaminan minimal |
| **UMKM** | Usaha mikro, kecil, menengah | Kredit usaha produktif |
| **Perumahan** | Masyarakat yang butuh KPR | Kredit perumahan terjangkau |

### Persona Pengguna

#### Persona 1: Siti (PMI)
- **Usia:** 28 tahun
- **Lokasi:** Jawa Timur
- **Kebutuhan:** Pinjaman Rp 15 juta untuk biaya penempatan ke Taiwan
- **Pain Points:** Proses berbelit, tidak tahu status pengajuan
- **Goals:** Mendapat pinjaman cepat dengan bunga wajar

#### Persona 2: Budi (Peternak)
- **Usia:** 45 tahun
- **Lokasi:** Jawa Tengah
- **Kebutuhan:** Modal Rp 50 juta untuk pengembangan peternakan ayam
- **Pain Points:** Sulit akses ke bank, jaminan terbatas
- **Goals:** Kredit dengan tenor panjang dan cicilan ringan

#### Persona 3: Ahmad (UMKM)
- **Usia:** 35 tahun
- **Lokasi:** Jakarta
- **Kebutuhan:** Modal kerja Rp 100 juta untuk ekspansi toko
- **Pain Points:** Persyaratan dokumen rumit
- **Goals:** Proses cepat dengan dokumen minimal

---

## 5. User Roles & Permissions

### 5.1 Role Hierarchy

```
                    ┌─────────────┐
                    │    ADMIN    │
                    │ (Full Access)│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐
   │VALIDATOR│       │BANK STAFF │      │ INSURANCE │
   └────┬────┘       └─────┬─────┘      └─────┬─────┘
        │                  │                  │
   ┌────▼────┐             │            ┌─────▼─────┐
   │ CHECKER │             │            │ COLLECTOR │
   │  AGENT  │             │            └───────────┘
   └────┬────┘             │
        │                  │
   ┌────▼────┐             │
   │  AGENT  │             │
   └────┬────┘             │
        │                  │
   ┌────▼────────────────▼─┐
   │   USER / WIRAUSAHA    │
   │     / PERUSAHAAN      │
   └───────────────────────┘
```

### 5.2 Role Definitions

#### 1. User (Peminjam)
**Role Code:** `user`

| Permission | Akses |
|------------|-------|
| Mengajukan pinjaman | ✅ |
| Upload dokumen | ✅ |
| Melihat status aplikasi sendiri | ✅ |
| Edit profil | ✅ |
| Melihat aplikasi orang lain | ❌ |
| Approve/reject aplikasi | ❌ |

#### 2. Wirausaha
**Role Code:** `wirausaha`

| Permission | Akses |
|------------|-------|
| Semua permission User | ✅ |
| Akses produk khusus UMKM | ✅ |
| Upload dokumen usaha | ✅ |

#### 3. Perusahaan (P3MI)
**Role Code:** `perusahaan`

| Permission | Akses |
|------------|-------|
| Mengajukan pinjaman bisnis | ✅ |
| Mengelola data calon PMI | ✅ |
| Batch application | ✅ |
| Melihat semua aplikasi perusahaan | ✅ |

#### 4. Agent
**Role Code:** `agent`

| Permission | Akses |
|------------|-------|
| Input aplikasi untuk user | ✅ |
| Verifikasi dokumen awal | ✅ |
| Melihat aplikasi yang di-assign | ✅ |
| Follow-up dengan peminjam | ✅ |
| Approve/reject aplikasi | ❌ |

#### 5. Checker Agent
**Role Code:** `checker_agent`

| Permission | Akses |
|------------|-------|
| Review aplikasi dari agent | ✅ |
| Quality control dokumen | ✅ |
| Approve/return ke agent | ✅ |
| Forward ke validator | ✅ |
| Final approval | ❌ |

#### 6. Validator
**Role Code:** `validator`

| Permission | Akses |
|------------|-------|
| Validasi mendalam aplikasi | ✅ |
| Credit scoring | ✅ |
| Approve/reject aplikasi | ✅ |
| Forward ke bank | ✅ |
| Pencairan dana | ❌ |

#### 7. Bank Staff
**Role Code:** `bank_staff`

| Permission | Akses |
|------------|-------|
| Final approval dari bank | ✅ |
| Setup loan terms | ✅ |
| Proses pencairan | ✅ |
| Monitoring repayment | ✅ |
| Akses semua bank | ❌ (hanya bank sendiri) |

#### 8. Insurance
**Role Code:** `insurance`

| Permission | Akses |
|------------|-------|
| Issue polis asuransi | ✅ |
| Underwriting | ✅ |
| Proses klaim | ✅ |
| Monitoring coverage | ✅ |

#### 9. Collector
**Role Code:** `collector`

| Permission | Akses |
|------------|-------|
| Monitoring pembayaran | ✅ |
| Penagihan | ✅ |
| Reporting status | ✅ |
| Negosiasi restrukturisasi | ✅ |

#### 10. Admin
**Role Code:** `admin`

| Permission | Akses |
|------------|-------|
| Full system access | ✅ |
| User management | ✅ |
| Bank management | ✅ |
| Product configuration | ✅ |
| System settings | ✅ |
| Audit logs | ✅ |

### 5.3 Access Matrix

| Feature | User | Wirausaha | Perusahaan | Agent | Checker | Validator | Bank Staff | Insurance | Collector | Admin |
|---------|------|-----------|------------|-------|---------|-----------|------------|-----------|-----------|-------|
| Dashboard | Own | Own | Company | Assigned | Review | All | Bank | Insurance | Collection | All |
| Apply Loan | ✅ | ✅ | ✅ | For User | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Upload Docs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Review Apps | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve/Reject | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Disburse | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Issue Policy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Collection | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Mgmt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bank Mgmt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reports | Own | Own | Company | Assigned | Review | All | Bank | Insurance | Collection | All |

---

## 6. Fitur Utama

### 6.1 Landing Page & Marketing

| Fitur | Deskripsi | Priority |
|-------|-----------|----------|
| Hero Section | Banner utama dengan CTA | P0 |
| Partner Banks | Tampilan logo bank mitra | P0 |
| Product Tabs | Navigasi produk (PMI, Peternak, dll) | P0 |
| About Section | Info OJK registration | P0 |
| Contact Section | Alamat, telepon, email | P0 |

### 6.2 Authentication & Authorization

| Fitur | Deskripsi | Priority |
|-------|-----------|----------|
| Sign Up | Registrasi dengan email | P0 |
| Sign In | Login dengan email/password | P0 |
| Role Selection | Pilih role saat registrasi | P0 |
| Auto Logout | Logout otomatis setelah 10 menit idle | P0 |
| Password Reset | Reset password via email | P1 |

### 6.3 Loan Application

| Fitur | Deskripsi | Priority |
|-------|-----------|----------|
| Application Form | Form pengajuan lengkap | P0 |
| Document Upload | Upload KTP, KK, NPWP, dll | P0 |
| Status Tracking | Timeline status aplikasi | P0 |
| Transaction ID | Unique ID untuk tracking | P0 |
| IP Logging | Audit trail IP address | P1 |

### 6.4 Dashboard per Role

| Dashboard | Fitur Utama | Priority |
|-----------|-------------|----------|
| User Dashboard | My applications, status, history | P0 |
| Agent Dashboard | Assigned apps, input new, follow-up | P0 |
| Validator Dashboard | Review queue, approve/reject | P0 |
| Bank Staff Dashboard | Final approval, disbursement | P0 |
| Insurance Dashboard | Policy issuance, claims | P1 |
| Collector Dashboard | Payment monitoring, collection | P1 |
| Admin Dashboard | Full system management | P0 |

### 6.5 Bank & Product Management

| Fitur | Deskripsi | Priority |
|-------|-----------|----------|
| Bank Management | CRUD bank mitra | P0 |
| Branch Management | CRUD cabang bank | P1 |
| Product Configuration | Setup produk pinjaman | P0 |
| Interest Rate Setup | Konfigurasi suku bunga | P0 |

### 6.6 Reporting & Analytics

| Fitur | Deskripsi | Priority |
|-------|-----------|----------|
| Application Reports | Laporan pengajuan | P1 |
| Approval Rate | Statistik approval | P1 |
| Disbursement Reports | Laporan pencairan | P1 |
| Collection Reports | Laporan penagihan | P2 |
| User Access Matrix | Audit akses user | P1 |

---

## 7. User Stories

### Epic 1: User Registration & Authentication

```
US-001: Sebagai calon peminjam, saya ingin mendaftar akun
        agar saya bisa mengajukan pinjaman.
        
        Acceptance Criteria:
        - Form registrasi dengan email, password, nama lengkap
        - Pilihan role (user/wirausaha/perusahaan)
        - Validasi email format
        - Password minimal 8 karakter
        - Redirect ke dashboard setelah registrasi
```

```
US-002: Sebagai user terdaftar, saya ingin login ke sistem
        agar saya bisa mengakses dashboard saya.
        
        Acceptance Criteria:
        - Form login dengan email dan password
        - Error message jika kredensial salah
        - Redirect ke dashboard sesuai role
        - Session management dengan auto logout 10 menit
```

### Epic 2: Loan Application

```
US-003: Sebagai peminjam, saya ingin mengajukan pinjaman
        agar saya bisa mendapat modal usaha.
        
        Acceptance Criteria:
        - Form dengan data pribadi, pekerjaan, pinjaman
        - Pilihan bank dan produk
        - Upload dokumen pendukung
        - Konfirmasi sebelum submit
        - Transaction ID setelah submit
```

```
US-004: Sebagai peminjam, saya ingin melihat status aplikasi
        agar saya tahu progress pengajuan saya.
        
        Acceptance Criteria:
        - Timeline visual status
        - Detail setiap tahap
        - Notifikasi perubahan status
        - Alasan jika ditolak
```

### Epic 3: Agent Workflow

```
US-005: Sebagai agent, saya ingin melihat aplikasi yang di-assign
        agar saya bisa follow-up dengan peminjam.
        
        Acceptance Criteria:
        - List aplikasi dengan filter status
        - Detail aplikasi lengkap
        - Kontak peminjam
        - History komunikasi
```

```
US-006: Sebagai agent, saya ingin input aplikasi untuk user
        agar saya bisa membantu user yang tidak bisa akses sistem.
        
        Acceptance Criteria:
        - Form sama dengan user
        - Pilih user atau input data baru
        - Upload dokumen atas nama user
        - Assign ke diri sendiri
```

### Epic 4: Validation & Approval

```
US-007: Sebagai validator, saya ingin review aplikasi
        agar saya bisa memutuskan kelayakan kredit.
        
        Acceptance Criteria:
        - Queue aplikasi untuk review
        - Detail lengkap dengan dokumen
        - Credit scoring tools
        - Approve/reject dengan alasan
        - Forward ke bank jika approve
```

```
US-008: Sebagai bank staff, saya ingin final approval
        agar saya bisa proses pencairan.
        
        Acceptance Criteria:
        - List aplikasi yang sudah divalidasi
        - Setup loan terms (bunga, tenor)
        - Final approve/reject
        - Trigger pencairan
```

### Epic 5: Administration

```
US-009: Sebagai admin, saya ingin mengelola user
        agar saya bisa kontrol akses sistem.
        
        Acceptance Criteria:
        - List semua user dengan filter
        - Create/edit/delete user
        - Assign/change role
        - Reset password
        - Deactivate user
```

```
US-010: Sebagai admin, saya ingin mengelola bank mitra
        agar saya bisa konfigurasi produk pinjaman.
        
        Acceptance Criteria:
        - CRUD bank
        - CRUD cabang
        - CRUD produk
        - Setup interest rate
        - Aktivasi/deaktivasi
```

---

## 8. Workflow & Business Process

### 8.1 Main Loan Application Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOAN APPLICATION WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   USER   │───▶│  AGENT   │───▶│ CHECKER  │───▶│VALIDATOR │───▶│  BANK    │
│          │    │          │    │  AGENT   │    │          │    │  STAFF   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     │ Submit        │ Review &      │ Quality       │ Credit        │ Final
     │ Application   │ Verify        │ Control       │ Analysis      │ Approval
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ PENDING  │───▶│  UNDER   │───▶│ CHECKED  │───▶│VALIDATED │───▶│ APPROVED │
│          │    │  REVIEW  │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                      │
                                                                      ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│COMPLETED │◀───│  ACTIVE  │◀───│DISBURSED │◀───│ INSURED  │◀───│INSURANCE │
│          │    │          │    │          │    │          │    │ PROCESS  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     ▲               │
     │               │ If Overdue
     │               ▼
     │          ┌──────────┐
     │          │COLLECTOR │
     │          │ PROCESS  │
     │          └──────────┘
     │               │
     └───────────────┘
```

### 8.2 Status Flow Diagram

```
                              ┌─────────┐
                              │ PENDING │
                              └────┬────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ REJECTED │  │  UNDER   │  │ RETURNED │
              │          │  │  REVIEW  │  │          │
              └──────────┘  └────┬────┘  └──────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ REJECTED │ │ CHECKED  │ │ RETURNED │
              │          │ │          │ │          │
              └──────────┘ └────┬────┘ └──────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ REJECTED │ │VALIDATED │ │ RETURNED │
              │          │ │          │ │          │
              └──────────┘ └────┬────┘ └──────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ REJECTED │ │ APPROVED │ │ RETURNED │
              │          │ │          │ │          │
              └──────────┘ └────┬────┘ └──────────┘
                                │
                                ▼
                          ┌──────────┐
                          │ INSURED  │
                          └────┬────┘
                                │
                                ▼
                          ┌──────────┐
                          │DISBURSED │
                          └────┬────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  ACTIVE  │ │ OVERDUE  │ │COMPLETED │
              │          │ │          │ │          │
              └──────────┘ └──────────┘ └──────────┘
```

### 8.3 Detailed Process Steps

#### Step 1: Application Submission (User)

```
1. User login ke sistem
2. Pilih menu "Ajukan Pinjaman"
3. Pilih kategori produk (PMI/Peternak/Petani/UMKM/Perumahan)
4. Pilih bank dan produk spesifik
5. Isi form data pribadi:
   - Nama lengkap
   - NIK
   - Tempat/tanggal lahir
   - Alamat
   - No. telepon
   - Email
6. Isi form data pekerjaan:
   - Status pekerjaan
   - Nama perusahaan
   - Jabatan
   - Penghasilan bulanan
7. Isi form data pinjaman:
   - Jumlah pinjaman
   - Tenor (bulan)
   - Tujuan pinjaman
8. Upload dokumen:
   - KTP
   - KK
   - NPWP (opsional)
   - Slip gaji/bukti penghasilan
   - Dokumen pendukung lainnya
9. Review dan konfirmasi
10. Submit aplikasi
11. Terima Transaction ID
```

#### Step 2: Agent Review

```
1. Agent menerima notifikasi aplikasi baru
2. Buka detail aplikasi
3. Verifikasi kelengkapan dokumen:
   - Semua dokumen wajib ada
   - Dokumen terbaca jelas
   - Data sesuai dengan dokumen
4. Jika tidak lengkap:
   - Return ke user dengan catatan
   - Status: RETURNED
5. Jika lengkap:
   - Forward ke Checker Agent
   - Status: UNDER_REVIEW
```

#### Step 3: Quality Control (Checker Agent)

```
1. Checker Agent menerima aplikasi dari Agent
2. Review kualitas verifikasi:
   - Cross-check data dengan dokumen
   - Validasi format dokumen
   - Cek duplikasi aplikasi
3. Jika ada masalah:
   - Return ke Agent dengan feedback
   - Status: RETURNED
4. Jika OK:
   - Approve dan forward ke Validator
   - Status: CHECKED
```

#### Step 4: Validation (Validator)

```
1. Validator menerima aplikasi yang sudah di-check
2. Lakukan analisis mendalam:
   - Credit scoring
   - Debt-to-income ratio
   - Employment verification
   - Collateral assessment (jika ada)
3. Keputusan:
   - REJECT: Tidak memenuhi kriteria
     - Input alasan penolakan
     - Status: REJECTED
   - APPROVE: Memenuhi kriteria
     - Forward ke Bank Staff
     - Status: VALIDATED
```

#### Step 5: Bank Approval (Bank Staff)

```
1. Bank Staff menerima aplikasi tervalidasi
2. Final review dari perspektif bank:
   - Compliance check
   - Risk assessment
   - Limit availability
3. Jika reject:
   - Input alasan
   - Status: REJECTED
4. Jika approve:
   - Setup loan terms:
     - Interest rate
     - Tenor
     - Monthly installment
     - Disbursement date
   - Status: APPROVED
   - Trigger insurance process
```

#### Step 6: Insurance Processing

```
1. Insurance Staff menerima notifikasi
2. Underwriting process:
   - Risk assessment
   - Premium calculation
3. Issue policy:
   - Policy number
   - Coverage amount
   - Premium amount
4. Status: INSURED
5. Trigger disbursement
```

#### Step 7: Disbursement

```
1. Bank Staff proses pencairan
2. Transfer dana ke rekening peminjam
3. Generate loan schedule
4. Status: DISBURSED
5. Loan menjadi ACTIVE
```

#### Step 8: Repayment & Collection

```
1. Peminjam melakukan pembayaran cicilan
2. Collector monitoring:
   - Due date tracking
   - Payment confirmation
3. Jika terlambat:
   - Reminder notification
   - Follow-up call
   - Visit jika perlu
   - Status: OVERDUE
4. Jika lunas:
   - Status: COMPLETED
   - Close loan
```

### 8.4 SLA (Service Level Agreement)

| Stage | Max Duration | Responsible |
|-------|--------------|-------------|
| Pending → Under Review | 1 hari kerja | Agent |
| Under Review → Checked | 1 hari kerja | Checker Agent |
| Checked → Validated | 2 hari kerja | Validator |
| Validated → Approved | 2 hari kerja | Bank Staff |
| Approved → Insured | 1 hari kerja | Insurance |
| Insured → Disbursed | 1 hari kerja | Bank Staff |
| **Total** | **8 hari kerja** | - |

---

## 9. Technical Requirements

### 9.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | ShadCN UI |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| State Management | React Hooks |
| Icons | Lucide React |

### 9.2 Database Schema

#### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loan Applications
CREATE TABLE loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  assigned_agent_id UUID REFERENCES users(id),
  bank_id UUID REFERENCES banks(id),
  product_id UUID REFERENCES bank_products(id),
  status TEXT NOT NULL DEFAULT 'pending',
  loan_amount NUMERIC NOT NULL,
  loan_purpose TEXT,
  tenor_months INTEGER,
  interest_rate NUMERIC,
  monthly_installment NUMERIC,
  employment_status TEXT,
  monthly_income NUMERIC,
  transaction_id TEXT UNIQUE,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Banks
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bank Products
CREATE TABLE bank_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES banks(id),
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  interest_rate NUMERIC,
  max_loan_amount NUMERIC,
  max_tenor_months INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9.3 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | User registration |
| `/auth/signin` | POST | User login |
| `/auth/signout` | POST | User logout |
| `/applications` | GET | List applications |
| `/applications` | POST | Create application |
| `/applications/:id` | GET | Get application detail |
| `/applications/:id` | PATCH | Update application |
| `/banks` | GET | List banks |
| `/products` | GET | List products |
| `/users` | GET | List users (admin) |

### 9.4 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Supabase Auth with JWT |
| Authorization | Row Level Security (RLS) |
| Session Management | Auto logout after 10 min idle |
| Data Encryption | HTTPS, encryption at rest |
| Password Policy | Min 8 chars, hashed with bcrypt |
| Audit Trail | IP logging, timestamp tracking |

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 2 seconds |
| Time to Interactive | < 5 seconds |
| Lighthouse Score | > 80 |

### 10.2 Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Planned Downtime | < 4 hours/month |
| Recovery Time | < 1 hour |

### 10.3 Scalability

| Metric | Target |
|--------|--------|
| Concurrent Users | 1,000+ |
| Daily Transactions | 10,000+ |
| Data Storage | 1TB+ |

### 10.4 Compatibility

| Platform | Support |
|----------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |
| Mobile | iOS 14+, Android 10+ |

---

## 11. UI/UX Guidelines

### 11.1 Brand Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Blue | `#5680E9` | Primary buttons, links |
| Light Blue | `#84CEEB` | Backgrounds, accents |
| Sky Blue | `#5AB9EA` | Hover states, highlights |
| Soft Blue | `#C1C8E4` | Borders, dividers |
| Purple | `#8860D0` | Secondary actions, badges |
| Black | `#000000` | Text |
| White | `#FFFFFF` | Backgrounds |

### 11.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 36px | Bold |
| H2 | Inter | 28px | Bold |
| H3 | Inter | 24px | Semibold |
| Body | Inter | 16px | Regular |
| Small | Inter | 14px | Regular |
| Caption | Inter | 12px | Regular |

### 11.3 Component Guidelines

- **Buttons**: Rounded corners (8px), consistent padding
- **Cards**: Shadow, rounded corners (12px), white background
- **Forms**: Clear labels, validation messages, loading states
- **Tables**: Zebra striping, sortable headers, pagination
- **Modals**: Centered, backdrop blur, close button

### 11.4 Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 640px | Phones |
| Tablet | 640px - 1024px | Tablets |
| Desktop | > 1024px | Laptops, Desktops |

---

## 12. Success Metrics

### 12.1 Business KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Registration | 10,000/month | Supabase Auth |
| Loan Applications | 5,000/month | Database count |
| Approval Rate | 70% | Approved/Total |
| Disbursement Rate | 90% | Disbursed/Approved |
| Default Rate | < 5% | Overdue > 90 days |

### 12.2 Technical KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monitoring tools |
| Error Rate | < 1% | Error logs |
| Page Load | < 3s | Lighthouse |
| API Response | < 2s | APM tools |

### 12.3 User Experience KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion | > 90% | Analytics |
| User Satisfaction | > 4/5 | Surveys |
| Support Tickets | < 100/month | Helpdesk |
| Bounce Rate | < 30% | Analytics |

---

## 13. Timeline & Milestones

### Phase 1: Foundation (Month 1-2)

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M1.1 | Project setup, tech stack | ✅ Done |
| M1.2 | Authentication system | ✅ Done |
| M1.3 | Landing page | ✅ Done |
| M1.4 | Database schema | ✅ Done |

### Phase 2: Core Features (Month 3-4)

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M2.1 | Loan application form | ✅ Done |
| M2.2 | Document upload | ✅ Done |
| M2.3 | User dashboard | ✅ Done |
| M2.4 | Agent dashboard | ✅ Done |

### Phase 3: Workflow (Month 5-6)

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M3.1 | Validator dashboard | ✅ Done |
| M3.2 | Bank staff dashboard | ✅ Done |
| M3.3 | Status tracking | ✅ Done |
| M3.4 | Auto logout | ✅ Done |

### Phase 4: Enhancement (Month 7-8)

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M4.1 | Insurance dashboard | 🔄 In Progress |
| M4.2 | Collector dashboard | 🔄 In Progress |
| M4.3 | Admin dashboard | ✅ Done |
| M4.4 | Reports & analytics | 📋 Planned |

### Phase 5: Production (Month 9-10)

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M5.1 | Self-hosted Supabase | 📋 Planned |
| M5.2 | Security audit | 📋 Planned |
| M5.3 | Performance optimization | 📋 Planned |
| M5.4 | Production deployment | 📋 Planned |

---

## 14. Risks & Mitigations

### 14.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database downtime | High | Low | Backup, failover |
| Security breach | Critical | Low | Encryption, audit |
| Performance issues | Medium | Medium | Caching, optimization |
| Integration failures | Medium | Medium | API versioning, testing |

### 14.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Marketing, UX improvement |
| Regulatory changes | High | Low | Compliance monitoring |
| Bank partner issues | Medium | Low | Multiple partners |
| High default rate | High | Medium | Credit scoring, collection |

### 14.3 Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Staff turnover | Medium | Medium | Documentation, training |
| Support overload | Medium | Medium | Self-service, FAQ |
| Data loss | Critical | Low | Backup, DR plan |

---

## 15. Appendix

### 15.1 Glossary

| Term | Definition |
|------|------------|
| KUR | Kredit Usaha Rakyat - Government-backed business credit |
| PMI | Pekerja Migran Indonesia - Indonesian Migrant Workers |
| P3MI | Perusahaan Penempatan Pekerja Migran Indonesia |
| OJK | Otoritas Jasa Keuangan - Financial Services Authority |
| RLS | Row Level Security - Database access control |
| SLA | Service Level Agreement |
| KPI | Key Performance Indicator |

### 15.2 References

- OJK Regulation on Financial Technology
- Supabase Documentation
- React Documentation
- Tailwind CSS Documentation

### 15.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Lendana Team | Initial release |

### 15.4 Contact Information

**PT. Lendana Digitalindo Nusantara**

- **Website:** lendana.co.id
- **Email:** info@lendana.co.id
- **Status:** Terdaftar di OJK sebagai Platform Agregator Teknologi Finansial

---

*Dokumen ini adalah Product Requirements Document resmi untuk Lendana Financial Access Platform. Semua perubahan harus melalui proses review dan approval.*
