# Panduan Teknis & Checklist Penyesuaian Tim IT HiBank
# Implementasi QR Code, Smart Deep-Link & Pre-filled eKYC (HiTalang Piloting)

---

## Informasi Dokumen

| Parameter | Keterangan |
| :--- | :--- |
| **Judul Dokumen** | Technical Integration Guide for HiBank IT Team: QR Code & Deep-Link Handshake |
| **Nomor Dokumen** | TECH-GUIDE-HIBANK-2026-01 |
| **Versi** | 1.0 |
| **Target Pembaca** | Tim Mobile App (Android/iOS), Tim Backend/Core Banking, Tim DevOps/Web, Tim QA HiBank |
| **Partner Integrasi** | PT Lendana Digitalindo Nusantara (Lendana) |
| **Klasifikasi** | Dokumen Teknis / Internal & Partner |

---

## 1. Latar Belakang & Tujuan

Dokumen ini disusun sebagai panduan teknis operasional (*action checklist*) bagi **Tim IT Bank Hibank Indonesia (HiBank)** dalam mengimplementasikan dan menyesuaikan komponen sistem aplikasi mobile, backend, dan infrastruktur web agar kompatibel dengan alur **QR Code Smart Deep-Link** dari ekosistem Lendana untuk produk **HiTalang**.

### Objektif Utama:
1. Calon PMI yang memindai QR Code di layar monitor Validator atau mengklik tautan dari WhatsApp langsung diarahkan ke aplikasi HiBank (atau ke Play Store / App Store jika aplikasi belum terpasang).
2. Data identitas calon PMI (Nama Lengkap, NIK, No. HP, Rincian Pinjaman) terisi otomatis (*pre-filled*) di layar eKYC & OTP aplikasi HiBank.
3. Menjamin tersedianya jalur pemulihan darurat (*Manual Recovery Fallback*) jika mekanisme *Install Referrer* terblokir di perangkat nasabah.

---

## 2. Arsitektur Format URL Deep-Link

Lendana menghasilkan tautan universal dengan struktur terstandarisasi sebagai berikut:

```text
https://hibank.id/dl/hitalang?token={referralToken}&ref={recoveryCode}&utm_source=lendana&utm_medium=validator_qr&utm_campaign=hitalang_piloting
```

### Parameter URL:
* `token` (*Required*): String token terenkripsi yang merepresentasikan sesi pengajuan calon PMI (Masa berlaku: **24 Jam**).
* `ref` (*Required*): Kode pemulihan unik 8-9 karakter (misal: `HTL-8921-X9`) untuk identifikasi manual.
* `utm_source` / `utm_medium`: Parameter pelacakan atribusi pemasaran (*analytics*).

---

## 3. Checklist Penyesuaian Tim Mobile App HiBank (Android & iOS)

### 3.1 Penyesuaian Aplikasi Android (Kotlin / Java / Flutter / React Native)

#### 1. Konfigurasi Android App Links (`AndroidManifest.xml`)
Daftarkan `intent-filter` dengan `autoVerify="true"` agar tautan `https://hibank.id/dl/hitalang` langsung membuka aplikasi tanpa memunculkan dialog pilihan browser:

```xml
<activity
    android:name=".ui.onboarding.HiTalangOnboardingActivity"
    android:exported="true">
    
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- Domain resmi HiBank -->
        <data
            android:scheme="https"
            android:host="hibank.id"
            android:pathPrefix="/dl/hitalang" />
    </intent-filter>
</activity>
```

#### 2. Integrasi Google Play Install Referrer API (Deferred Deep-Link)
Untuk menangani kondisi di mana calon PMI **belum menginstal aplikasi**, tambahkan dependensi *Google Play Install Referrer* pada `build.gradle`:

```groovy
dependencies {
    implementation 'com.android.installreferrer:installreferrer:2.2'
}
```

**Logika Ekstraksi saat Aplikasi Pertama Kali Dibuka (*Cold Launch*):**
```kotlin
val referrerClient = InstallReferrerClient.newBuilder(context).build()
referrerClient.startConnection(object : InstallReferrerStateListener {
    override fun onInstallReferrerSetupFinished(responseCode: Int) {
        if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
            val response = referrerClient.installReferrer
            val referrerUrl = response.installReferrer // e.g., "utm_source=lendana&token=rft_eyJ..."
            
            val params = Uri.parse("https://hibank.id/dummy?$referrerUrl")
            val token = params.getQueryParameter("token")
            val recoveryCode = params.getQueryParameter("ref")
            
            if (!token.isNullOrEmpty()) {
                // Sesi Lendana ditemukan! Navigasi langsung ke modul HiTalang eKYC
                resolveReferralSession(token)
            }
            referrerClient.endConnection()
        }
    }
    override fun onInstallReferrerServiceDisconnected() {}
})
```

---

### 3.2 Penyesuaian Aplikasi iOS (Swift / Objective-C)

#### 1. Konfigurasi Associated Domains (Universal Links)
1. Pada proyek Xcode di bawah tab **Signing & Capabilities**, tambahkan capability **Associated Domains**.
2. Masukkan domain:
   ```text
   applinks:hibank.id
   ```

#### 2. Handling Universal Link di `AppDelegate.swift` / `SceneDelegate.swift`
```swift
func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let incomingURL = userActivity.webpageURL,
          let components = URLComponents(url: incomingURL, resolvingAgainstBaseURL: true) else {
        return
    }
    
    if incomingURL.path.contains("/dl/hitalang") {
        let token = components.queryItems?.first(where: { $0.name == "token" })?.value
        let recoveryCode = components.queryItems?.first(where: { $0.name == "ref" })?.value
        
        if let token = token {
            // Arahkan langsung ke Layar eKYC HiTalang
            navigateToHiTalangEkyc(token: token, recoveryCode: recoveryCode)
        }
    }
}
```

---

### 3.3 Penyesuaian Tampilan Layar eKYC & Manual Fallback (UI/UX Mobile)

#### 1. Layar Form eKYC & OTP Pre-filled:
* Field identitas berikut wajib ditampilkan dalam keadaan **sudah terisi otomatis (*pre-filled*)** dan berstatus *read-only*:
  - **Nama Lengkap:** `SITI NURHALIZA` *(dengan tanda centang hijau verified Lendana)*
  - **NIK:** `3201234567890001`
  - **Nomor HP:** `+6281234567890`
  - **Produk:** `HiTalang PMI (Plafon Rp 25.000.000 / 12 Bulan)`
* Nasabah hanya perlu melakukan 2 tindakan cepat:
  1. Input 4-digit SMS OTP yang dikirimkan ke nomor HP nasabah.
  2. Melakukan *Liveness Face Detection* (pemindaian wajah biometrik).

#### 2. Layar Manual Recovery (Jalur Cadangan Jika Deep-Link Gagal):
* Di halaman awal (Login/Register HiBank), tambahkan tombol/link:  
  👉 *"Mendaftar via Program Kemitraan Lendana / HiTalang?"*
* Sediakan form pencarian sederhana:
  - Input **Nomor Handphone Terdaftar**
  - Input **NIK (16 Digit)** *(atau Kode Pemulihan `HTL-XXXX-XX`)*
* Tombol aksi: `[ Cari Pengajuan ]` $\rightarrow$ Server HiBank memvalidasi sesi $\rightarrow$ Form eKYC pre-filled langsung terbuka.

---

## 4. Checklist Penyesuaian Tim DevOps, Web & Infrastruktur HiBank

### 4.1 Hosting File Verifikasi Domain (`.well-known`)

Agar Android App Links dan iOS Universal Links dapat terverifikasi secara otomatis oleh sistem operasi, tim Web/DevOps HiBank wajib menghosting 2 file konfigurasi statis pada root web server:

#### 1. Android Domain Verification (`https://hibank.id/.well-known/assetlinks.json`)
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "id.co.hibank.digital",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7D:0F:52:CC:E3:..." // Masukkan SHA-256 Release & Debug Key HiBank
      ]
    }
  }
]
```
> *Catatan: File harus dapat diakses publik via HTTPS dengan Content-Type: `application/json` tanpa proteksi login / redirect.*

#### 2. Apple Universal Links Verification (`https://hibank.id/.well-known/apple-app-site-association`)
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.id.co.hibank.digital",
        "paths": [ "/dl/hitalang*" ]
      }
    ]
  }
}
```
> *Catatan: File harus disajikan tanpa ekstensi `.json` dan mendukung HTTPS murni.*

---

### 4.2 Web Fallback & Store Redirection Script (`https://hibank.id/dl/hitalang`)

Jika tautan dibuka melalui browser biasa (misal diuji di komputer atau perangkat tanpa aplikasi), halaman web server HiBank wajib melakukan *smart redirect*:

```javascript
// Script routing di web server https://hibank.id/dl/hitalang
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const ref = urlParams.get('ref');
const userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (/android/i.test(userAgent)) {
    // Redirect ke Play Store dengan parameter referrer
    const referrer = encodeURIComponent(`utm_source=lendana&token=${token}&ref=${ref}`);
    window.location.href = `https://play.google.com/store/apps/details?id=id.co.hibank.digital&referrer=${referrer}`;
} else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    // Redirect ke App Store
    window.location.href = `https://apps.apple.com/id/app/hibank/id123456789`;
} else {
    // Desktop: Tampilkan instruksi QR Code
    window.location.href = `https://hibank.id/landing/hitalang-mitra?token=${token}`;
}
```

---

## 5. Checklist Penyesuaian Tim Backend & Core Banking HiBank

### 5.1 Endpoint Penanganan di Backend HiBank

| Endpoint | Pemanggil | Fungsi |
| :--- | :--- | :--- |
| `POST /api/v1.0/app/referral/resolve` | HiBank Mobile App | Memvalidasi `referralToken` yang didapat dari deep-link dan mengembalikan data pre-fill. |
| `POST /api/v1.0/app/referral/manual-recover` | HiBank Mobile App | Menerima NIK + No. HP atau `recoveryCode` jika deep-link gagal di perangkat. |
| `POST /webhooks/hibank/callback` | HiBank Core Server $\to$ Lendana | Mengirim notifikasi status `EKYC_COMPLETED`, `APPROVED`, atau `REJECTED` ke server Lendana. |

### 5.2 Pengambilan Data Sensitif via S2S API Lendana (Enkripsi AES-256-GCM)
Ketika backend HiBank menerima `referralToken` atau data manual recovery dari aplikasi mobile:
1. Backend HiBank memanggil API Lendana:  
   `POST https://api.lendana.id/api/v1.0/s2s/hitalang/applicant-data`
2. Menggunakan autentikasi **SNAP BI OAuth 2.0 (mTLS + RSA-SHA256 Signature)**.
3. Backend HiBank mendekripsi payload `encryptedData` menggunakan Kunci Simetris **AES-256-GCM** yang telah disepakati di KMS.
4. Menyimpan data nasabah ke core banking dan mengirimkan response pre-fill ke aplikasi mobile.

---

## 6. Checklist Matriks Pengujian & UAT Bersama (QA Checklist)

| No | Skenario Pengujian | Hasil yang Diharapkan | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Scan QR Code (Aplikasi Sudah Terpasang)** | Aplikasi HiBank langsung terbuka tanpa melewati browser $\to$ Masuk ke halaman eKYC HiTalang. | [ ] |
| **2** | **Scan QR Code (Aplikasi Belum Terpasang)** | Diarahkan ke Google Play Store / App Store $\to$ Setelah install & buka, aplikasi otomatis mengenali token dan membuka form eKYC. | [ ] |
| **3** | **Klik Link dari Pesan WhatsApp** | Tautan `https://hibank.id/dl/hitalang?...` membuka aplikasi HiBank dan data terisi otomatis. | [ ] |
| **4** | **Pengujian Manual Recovery Code** | Deep-link dimatikan sengaja $\to$ Input NIK & No. HP atau Kode `HTL-8921-X9` $\to$ Sesi berhasil dipulihkan. | [ ] |
| **5** | **Uji Masa Kedaluwarsa (> 24 Jam)** | Token berumur 25 jam ditolak dengan pesan: *"Sesi kedaluwarsa, silakan minta link baru dari Lendana"*. | [ ] |
| **6** | **Dekripsi S2S AES-256-GCM** | Data PII (NIK, Nama, No. HP) berhasil didekripsi dengan integritas Auth Tag 100% valid. | [ ] |
| **7** | **Notifikasi Webhook ke Lendana** | Selesai eKYC di HiBank $\to$ Status di Dashboard Validator Lendana berubah menjadi `🟢 eKYC Berhasil`. | [ ] |

---

## 7. Rangkuman PIC & Kontak Dukungan Teknis Lendana

Untuk koordinasi teknis, pertukaran sertifikat mTLS, dan pengujian API Sandbox, tim IT HiBank dapat menghubungi:

* **Tim Integrasi & API Lendana:** `api-integration@lendana.id`
* **Lead Security Architect:** `security@lendana.id`
* **Endpoint Sandbox Lendana:** `https://sandbox-api.lendana.id`
* **Spesifikasi Lengkap Dokumen Terkait:**
  - [PRD_HIBANK_HITALANG_INTEGRATION.md](file:///c:/Users/Lenovo/Documents/tempolendana3/docs/PRD_HIBANK_HITALANG_INTEGRATION.md) (PRD Produk & Alur Bisnis)
  - [PRD_HIBANK_S2S_DATA_PULL_API.md](file:///c:/Users/Lenovo/Documents/tempolendana3/docs/PRD_HIBANK_S2S_DATA_PULL_API.md) (Spesifikasi Enkripsi AES-256 S2S API)

---
*Dokumen ini diterbitkan oleh Tim Engineering PT Lendana Digitalindo Nusantara untuk Kemitraan HiBank HiTalang.*
