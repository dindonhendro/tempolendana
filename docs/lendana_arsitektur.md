# DOKUMEN ARSITEKTUR APLIKASI
# PT. Lendana Digitalindo Nusantara

**Subjek:** Deskripsi Arsitektur Sistem Informasi (Untuk Perijinan OJK)  
**Versi:** 2.1.0  
**Tanggal:** 12 Februari 2026  
**Klasifikasi:** Rahasia  

---

## DAFTAR ISI

1. [Ringkasan Arsitektur](#1-ringkasan-arsitektur)
2. [Lapis Aplikasi (Frontend)](#2-lapis-aplikasi-frontend)
3. [Lapis Backend & Database](#3-lapis-backend--database)
4. [Mekanisme Keamanan & Integritas Data](#4-mekanisme-keamanan--integritas-data)
5. [Infrastruktur & Deployment](#5-infrastruktur--deployment)
6. [Alur Data (Data Flow)](#6-alur-data-data-flow)

---

## 1. RINGKASAN ARSITEKTUR

Platform **Tempolendana** dibangun menggunakan arsitektur modern berorientasi cloud (*Cloud-Native Architecture*) yang memisahkan antara Presentation Layer, Logic Layer, dan Data Layer secara tegas.

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (Web Dashboard - React/Vite/TypeScript)  │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      AUTHENTICATION         │ │       API GATEWAY           │
│    (Supabase Auth/GoTrue)   │ │      (PostgREST / Edge)     │
└───────────────┬─────────────┘ └─────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER (PostgreSQL 14+ / Supabase Backend)              │
├─────────────────────────────────────────────────────────────┤
│ • Tables & Schemas (Public, Auth, Storage)                  │
│ • Database Functions (PL/pgSQL)                             │
│ • Row Level Security (RLS) Policies                         │
│ • Triggers for Audit & Immutability                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. LAPIS APLIKASI (FRONTEND)

Frontend dikembangkan dengan standar Progressive Web Application (PWA) untuk memastikan aksesibilitas tinggi bagi agen di lapangan.

- **Framework:** React.js 18+ dengan Vite sebagai build tool.
- **Bahasa:** TypeScript (Strict Mode) untuk memastikan tipe data yang konsisten.
- **State Management:** React Hooks & Context API.
- **Styling:** Tailwind CSS / Vanilla CSS untuk performa optimal.
- **Client Side Security:** 
    - Santisasi input otomatis via React.
    - Proteksi CSRF melalui mekanisme token Supabase.

---

## 3. LAPIS BACKEND & DATABASE

Lendana mengadopsi konsep *Backend-as-a-Service* menggunakan **Supabase** yang telah di-hardening untuk keperluan sektor finansial.

### 3.1 Database PostgreSQL
Menggunakan PostgreSQL 14+ sebagai *Single Source of Truth* dengan fitur:
- **Relational Integrity:** Menjamin konsistensi data antara pemohon, agen, dan bank.
- **Schema Separation:** Pemisahan skema antara data publik dan data sensitif internal.

### 3.2 Logic on Database (PL/pgSQL)
Aplikasi meminimalkan logika bisnis di sisi klien dengan memindahkannya ke fungsi basis data yang aman:
- **Stored Procedures:** Untuk perhitungan bunga, limit pinjaman, dan verifikasi skor kredit.
- **Database Triggers:** Untuk otomatisasi pencatatan jejak audit (*Audit Trail*).

---

## 4. MEKANISME KEAMANAN & INTEGRITAS DATA

Sesuai regulasi OJK mengenai keamanan informasi:

### 4.1 Data Immutability (Integritas Data)
Setiap aplikasi pinjaman yang sudah divalidasi akan dikunci menggunakan **Hash SHA-256**. Perubahan sekecil apapun pada data tersebut akan membatalkan validitas hash, menjamin data tidak dimanipulasi setelah persetujuan.

### 4.2 Row Level Security (RLS)
Lendana mengimplementasikan kebijakan RLS yang sangat ketat:
- **User:** Hanya dapat melihat data milik sendiri.
- **Agent:** Hanya dapat melihat data pemohon yang ditugaskan kepadanya.
- **Validator:** Memiliki akses baca ke data yang perlu divalidasi namun tidak dapat mengubah isi aplikasi.

### 4.3 Audit Trail Global
Sistem mencatat setiap aktivitas INSERT, UPDATE, dan DELETE termasuk:
- Siapa yang melakukan perubahan (User ID).
- Kapan dilakukan (Timestamp presisi milidetik).
- IP Address dan User Agent pengakses.
- Data sebelum (*Before*) dan sesudah (*After*) perubahan.

---

## 5. INFRASTRUKTUR & DEPLOYMENT

- **Cloud Platform:** BiznetGio melalui provider Supabase.
- **Data Residency:** Memastikan penyimpanan data di server wilayah Indonesia (sesuai regulasi PDP).
- **Blob Storage:** Menggunakan Storage Bucket yang terenkripsi untuk menyimpan dokumen sensitif (KTP/NPWP).
- **Backup & Disaster Recovery:** Otomasi Warm backup 
dengan lokasi data center utama dan DRC yang berbeda lokasi
---

## 6. ALUR DATA (DATA FLOW)

1. **Submission:** User mengisi form -> Validasi tipe data (Frontend) -> Simpan ke Tabel `loan_applications` (Backend).
2. **Review:** Agen memvalidasi dokumen -> Sistem mencatat log setiap perubahan status.
3. **Approval:** Validator menyetujui -> Sistem meng-generate **Data Hash** -> Status terkunci (**Immutable**).
4. **Disbursement:** Data dikirim secara aman ke mitra Perbankan/Fintech melalui API terenkripsi.

---

**Disusun oleh:**  
*Technical Architecture Team*  
*PT. Lendana Digitalindo Nusantara*  

---
*DOKUMEN INI ADALAH PROPERTI KEKAYAAN INTELEKTUAL PT. LENDANA DIGITALINDO NUSANTARA*
