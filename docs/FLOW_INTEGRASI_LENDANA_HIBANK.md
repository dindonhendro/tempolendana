# Dokumen Alur Integrasi Lendana x HiBank (Piloting HiTalang)

Dokumen ini menjelaskan alur integrasi ujung-ke-ujung (end-to-end integration flow) antara **Lendana Financial Access Platform** dan **PT Bank Hibank Indonesia (HiBank)** untuk piloting produk **HiTalang** (dana talangan Pekerja Migran Indonesia - PMI).

Integrasi ini dirancang menggunakan standar keamanan industri perbankan (SNAP BI, enkripsi PII AES-256-GCM) serta jembatan handoff lintas perangkat (*cross-device*) yang mulus dari komputer Validator ke smartphone PMI.

---

## 1. Peta Arsitektur & Alur Bisnis (User Journey)

Proses dimulai dari verifikasi berkas oleh petugas Lendana (Validator) dan beralih ke verifikasi mandiri (eKYC & OTP) oleh PMI menggunakan smartphone pribadi:

```mermaid
graph TD
    classDef primary fill:#5680E9,stroke:#3b5ebd,color:#fff,font-weight:bold;
    classDef success fill:#10B981,stroke:#059669,color:#fff,font-weight:bold;
    classDef warning fill:#F59E0B,stroke:#D97706,color:#fff,font-weight:bold;
    
    A[Validator Dashboard Desktop] -->|1. Kirim ke HiBank| B(Lendana Backend)
    B -->|2. POST /referral-initiate| C(HiBank Server)
    C -->|3. Kirim Referral Token & Recovery Code| B
    B -->|4. Tampilkan Handoff Modal| A
    
    A -->|Opsi A: Scan QR Code di Tempat| D[Smartphone PMI]
    A -->|Opsi B: Direct WA Message via wa.me| D
    
    D -->|5. Buka Link / Unduh Aplikasi| E{Aplikasi Terpasang & Token Valid?}
    E -->|Ya: Jalur Otomatis| F[eKYC & OTP Pre-filled]
    E -->|Tidak: Jalur Fallback| G[Layar Daftar via Mitra Lendana]
    G -->|Input NIK + No. HP / Recovery Code| H(Validate Token ke Server)
    H --> F
    
    F -->|6. Liveness Test & SMS OTP| I(eKYC Selesai & Disetujui)
    I -->|7. Webhook Callback| B
    B -->|8. Sinkronisasi Real-time| A:::success
```

---

## 2. Diagram Sekuens Teknis (Technical Sequence Diagram)

Interaksi teknis antar-komponen sistem (Lendana Frontend/Backend, WhatsApp, Google Play Store/App Store, Aplikasi HiBank, dan Backend HiBank) dijabarkan dalam diagram berikut:

```mermaid
sequenceDiagram
    autonumber
    actor VAL as Validator (Desktop)
    actor PMI as Calon PMI (Smartphone)
    participant VAL_DASH as Validator Dashboard
    participant LDN_BE as Lendana Backend
    participant HIBANK_API as HiBank Onboarding API
    participant STORE as Play Store / App Store
    participant HIBANK_APP as HiBank Mobile App
    participant HIBANK_BE as HiBank Core/eKYC

    Note over VAL, HIBANK_BE: FASE 1: INISIASI DI DASHBOARD VALIDATOR
    VAL->>VAL_DASH: Pilih Produk HiTalang & Klik "Kirim ke HiBank"
    VAL_DASH->>LDN_BE: POST /api/validator/applications/{id}/submit-hibank
    LDN_BE->>HIBANK_API: POST /v1.0/partner/hitalang/referral-initiate (Encrypted PII)
    Note over LDN_BE, HIBANK_API: SNAP BI OAuth 2.0 (mTLS & RSA-SHA256 Signature)
    HIBANK_API-->>LDN_BE: 200 OK (referralToken, recoveryCode, smartDeepLink, expiresAt)
    LDN_BE-->>VAL_DASH: Return Handoff Data (smartDeepLink, qrData, recoveryCode)
    VAL_DASH->>VAL: Tampilkan Modal "Validator Handoff Hub" (QR Code + Tombol WA)

    Note over VAL, PMI: FASE 2: PENGALIHAN SESI (HANDOFF CHANNELS)
    alt Handoff via WhatsApp Direct (Click-to-Chat)
        VAL->>VAL_DASH: Klik "Kirim Link ke WhatsApp PMI"
        VAL_DASH->>VAL: Buka browser ke wa.me dengan pesan pre-filled terenkripsi
        VAL->>PMI: Kirim pesan WhatsApp berisi tautan Deep-Link & Kode Pemulihan
        PMI->>STORE: PMI klik tautan WhatsApp -> Buka Store
    else Handoff via Dynamic QR Code Scanner
        VAL->>PMI: Tunjukkan Layar Monitor berisi Dynamic QR Code
        PMI->>VAL_DASH: Scan QR Code menggunakan kamera smartphone
        PMI->>STORE: Dialihkan ke Store
    end

    Note over PMI, HIBANK_BE: FASE 3: INSTALASI & RESOLUSI SESI ONBOARDING
    PMI->>STORE: Unduh & Pasang Aplikasi HiBank (jika belum ada)
    PMI->>HIBANK_APP: Buka Aplikasi HiBank

    alt Skenario A: Deep-Link / Install Referrer Berhasil
        HIBANK_APP->>HIBANK_APP: Ekstrak parameter token dari Play Referrer
        HIBANK_APP->>HIBANK_BE: POST /v1.0/app/referral/resolve (referralToken)
        HIBANK_BE-->>HIBANK_APP: Return Data Pre-filled PMI
    else Skenario B: Deep-Link Gagal (Manual Recovery Fallback)
        HIBANK_APP->>PMI: Tampilkan opsi "Daftar via Mitra Lendana"
        PMI->>HIBANK_APP: Input kombinasi [NIK & No. HP] atau [Kode Pemulihan]
        HIBANK_APP->>HIBANK_BE: POST /v1.0/app/referral/manual-recover (identifier, NIK, No. HP)
        HIBANK_BE-->>HIBANK_APP: Validasi & Return Data Pre-filled PMI
    end

    Note over PMI, HIBANK_BE: FASE 4: VERIFIKASI MANDIRI & WEBHOOK STATUS
    HIBANK_APP->>PMI: Tampilkan Form eKYC Terisi Otomatis (Nama, NIK, No. HP, Nominal Pinjaman)
    PMI->>HIBANK_APP: Konfirmasi SMS OTP & Liveness Face Detection (Verifikasi Wajah)
    HIBANK_APP->>HIBANK_BE: Submit eKYC untuk Persetujuan Kredit
    HIBANK_BE->>LDN_BE: Notifikasi Webhook (Event: LOAN_APPLICATION_STATUS_UPDATED, Status: APPROVED/EKYC_COMPLETED)
    LDN_BE->>VAL_DASH: Sinkronisasi Real-time via Webhook (Update Status: eKYC Berhasil)
    VAL_DASH-->>VAL: Badge Status Berubah menjadi Hijau (eKYC Berhasil)
```

---

## 3. Protokol Keamanan & Kriptografi Data

Integrasi ini mengikuti ketentuan ketat regulasi perbankan OJK dan Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022):

### 3.1 SNAP BI Standard Compliance
* **Mutual TLS (mTLS):** Enkripsi jalur komunikasi server-to-server menggunakan sertifikat TLS 1.3 bersertifikat CA resmi.
* **Autentikasi OAuth 2.0:** Menggunakan *Client Credentials* dengan metode penandatanganan payload asimetris menggunakan **RSA-SHA256 Signature**.
* **Integrasi Header:** Setiap request menyertakan header anti-replay (`X-TIMESTAMP` dan `X-EXTERNAL-ID` berupa UUIDv4).

### 3.2 Handshake Enkripsi Data Sensitif (PII Encryption)
Data identitas nasabah yang dikirimkan dari Lendana ke HiBank tidak dikirimkan dalam bentuk teks polos (*plaintext*).
* **Algoritma:** **AES-256-GCM** (kunci simetris disepakati melalui Key Management System - KMS).
* **Payload Enkripsi:** Data sensitif seperti `nik`, `fullName`, dan `mobilePhoneNumber` dibungkus di dalam parameter `encryptedPayload` pada request JSON.
* **Token Sesi (JWT):** Sesi deep-link menggunakan format JWT terenkripsi dengan algoritma **HS256** berkunci rahasia bersama, dengan masa berlaku ketat **24 Jam**.

---

## 4. Mekanisme Pemulihan & Penanganan Error (Edge Cases)

| Skenario Kasus | Masalah | Solusi & Jalur Alternatif |
| :--- | :--- | :--- |
| **Gagal Atribusi Deep-Link (OS Block / Clean Install)** | Sesi token referral hilang ketika aplikasi dibuka setelah instalasi pertama kali. | **Manual Recovery Fallback:** Nasabah diarahkan menekan menu *"Daftar via Mitra Lendana"* di layar awal HiBank, lalu memasukkan kombinasi **No. HP & NIK** atau **Kode Pemulihan** (`HTL-XXXX-XX`) untuk menarik ulang sesi dari server. |
| **Nomor WA Calon PMI Tidak Aktif / Gagal Kirim** | Pesan WhatsApp dispatcher tidak masuk ke perangkat PMI. | **QR Code Scanner:** Validator meminta PMI memindai QR Code interaktif secara langsung di layar monitor kantor cabang Lendana/P3MI. |
| **Sesi eKYC Kedaluwarsa (> 24 Jam)** | PMI baru melakukan eKYC setelah lewat dari batas waktu SLA 24 jam. | **Re-Generate Token:** Validator menekan tombol `[ ⚡ Re-Generate Link ]` di dashboard Lendana untuk memperbarui token masa berlaku 24 jam baru tanpa perlu menginput ulang data PMI. |
| **Salah Kirim WhatsApp ke Penerima Lain** | Tautan dan kode pemulihan terkirim ke nomor orang lain. | **Keamanan Biometrik & OTP:** Tautan dan data hanya dapat diselesaikan jika sesuai dengan kecocokan wajah biometrik PMI (liveness detection) dan verifikasi SMS OTP nomor HP terdaftar. |

---

## 5. Implementasi Kode pada Platform Lendana

Di dalam kode program aplikasi Lendana, flow integrasi ini didukung oleh tiga modul utama:

1. **`hibankService.ts`** ([Tautan File](file:///c:/Users/Lenovo/Documents/tempolendana3/src/lib/hibankService.ts)):
   - Bertanggung jawab memicu request referral ke API HiBank.
   - Membuat JWT token token referral (HS256) untuk simulasi deep-link.
   - Menyediakan generator teks pesan WhatsApp Click-to-Chat (`wa.me`).
2. **`HiBankHandoffModal.tsx`** ([Tautan File](file:///c:/Users/Lenovo/Documents/tempolendana3/src/components/pmi/HiBankHandoffModal.tsx)):
   - Modal pop-up antarmuka di Validator Dashboard yang menampilkan QR Code dinamis dan tombol pintasan kirim WhatsApp.
   - Menghitung waktu hitung mundur (*countdown timer*) SLA 24 jam secara real-time.
3. **`HiBankEkycSimulatorModal.tsx`** ([Tautan File](file:///c:/Users/Lenovo/Documents/tempolendana3/src/components/pmi/HiBankEkycSimulatorModal.tsx)):
   - Simulator antarmuka smartphone PMI untuk memvalidasi OTP, liveness test, dan mengirim notifikasi status eKYC (APPROVED) kembali ke dashboard Lendana.
