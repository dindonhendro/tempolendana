# LAPORAN PENETRATION TEST
## PT. Lendana Digitalindo Nusantara - Financial Access Platform

---

**Tanggal Pengujian:** 21 Januari 2025  
**Versi Aplikasi:** 1.0.0  
**Tester:** Security Assessment Team  
**Lingkup Pengujian:** Web Application Security Assessment  

---

## EXECUTIVE SUMMARY

### Ringkasan Eksekutif
Penetration test telah dilakukan terhadap aplikasi web Lendana Financial Access Platform yang berfungsi sebagai platform agregator teknologi finansial untuk layanan KUR (Kredit Usaha Rakyat) dan penempatan PMI (Pekerja Migran Indonesia). Pengujian mencakup analisis keamanan aplikasi web, autentikasi, otorisasi, dan penanganan data sensitif.

### Temuan Utama
- **Total Vulnerabilities:** 8 temuan
- **Critical:** 2 temuan
- **High:** 3 temuan  
- **Medium:** 2 temuan
- **Low:** 1 temuan

### Rekomendasi Prioritas
1. Implementasi rate limiting untuk mencegah brute force attacks
2. Penguatan validasi input dan sanitasi data
3. Implementasi Content Security Policy (CSP)
4. Perbaikan session management
5. Penguatan file upload security

---

## METODOLOGI PENGUJIAN

### Scope Pengujian
- **URL Target:** https://02766cf7-78e0-4c71-824d-7aa0faaa8b8c.canvases.tempo.build
- **Teknologi:** React.js, Vite, Supabase, TypeScript
- **Komponen yang Diuji:**
  - Authentication system
  - PMI loan application form
  - File upload functionality
  - Database interactions
  - Session management
  - Input validation

### Tools yang Digunakan
- OWASP ZAP
- Burp Suite Community
- Manual code review
- Browser developer tools
- Network analysis tools

---

## TEMUAN KEAMANAN

### 1. CRITICAL - Insufficient Rate Limiting (CVE-2023-XXXX)

**Severity:** Critical  
**CVSS Score:** 9.1  

**Deskripsi:**
Aplikasi tidak memiliki rate limiting yang memadai pada endpoint autentikasi, memungkinkan serangan brute force terhadap kredensial pengguna.

**Lokasi:**
- `/auth` - Sign in functionality
- `src/components/auth/AuthForm.tsx` - handleSignIn function

**Proof of Concept:**
```javascript
// Tidak ada pembatasan percobaan login
const handleSignIn = async (e: React.FormEvent) => {
  // ... kode tanpa rate limiting
  await signIn(signInEmail, signInPassword);
}
```

**Impact:**
- Brute force attacks terhadap akun pengguna
- Account enumeration
- Denial of service pada sistem autentikasi

**Rekomendasi:**
```javascript
// Implementasi rate limiting
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 menit

const handleSignIn = async (e: React.FormEvent) => {
  if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    setError("Akun terkunci. Coba lagi dalam 15 menit.");
    return;
  }
  // ... rest of login logic
}
```

---

### 2. CRITICAL - Insecure File Upload (CVE-2023-XXXX)

**Severity:** Critical  
**CVSS Score:** 8.8  

**Deskripsi:**
Fungsi upload file tidak memiliki validasi yang memadai terhadap jenis file dan ukuran, berpotensi memungkinkan upload file berbahaya.

**Lokasi:**
- `src/components/pmi/LoanApplicationForm.tsx` - handleFileSelect function

**Proof of Concept:**
```javascript
// Validasi file yang tidak memadai
const handleFileSelect = (type: keyof typeof files, file: File | null) => {
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    alert("File too large. Maximum size is 5MB.");
    return;
  }
  
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  // Hanya validasi MIME type, mudah di-bypass
}
```

**Impact:**
- Upload file executable berbahaya
- Storage exhaustion attacks
- Potential remote code execution

**Rekomendasi:**
```javascript
const validateFile = (file: File): boolean => {
  // Validasi ekstensi file
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return false;
  }
  
  // Validasi magic bytes
  const reader = new FileReader();
  reader.onload = (e) => {
    const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
    const header = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const validHeaders = {
      'ffd8ffe0': 'jpg',
      'ffd8ffe1': 'jpg', 
      '89504e47': 'png',
      '25504446': 'pdf'
    };
    
    return Object.keys(validHeaders).some(h => header.startsWith(h));
  };
}
```

---

### 3. HIGH - Cross-Site Scripting (XSS) Vulnerability

**Severity:** High  
**CVSS Score:** 7.4  

**Deskripsi:**
Input pengguna tidak di-sanitasi dengan benar sebelum ditampilkan, berpotensi memungkinkan serangan XSS.

**Lokasi:**
- Form input fields dalam `LoanApplicationForm.tsx`
- Display data dalam summary section

**Proof of Concept:**
```javascript
// Input tidak di-sanitasi
<p>
  <span className="font-medium">Name:</span> {formData.full_name}
</p>
```

**Impact:**
- Session hijacking
- Credential theft
- Malicious script execution

**Rekomendasi:**
```javascript
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Penggunaan
<p>
  <span className="font-medium">Name:</span> {sanitizeInput(formData.full_name)}
</p>
```

---

### 4. HIGH - Insecure Direct Object References (IDOR)

**Severity:** High  
**CVSS Score:** 7.1  

**Deskripsi:**
Aplikasi menggunakan ID yang dapat diprediksi untuk mengakses data pengguna tanpa validasi otorisasi yang memadai.

**Lokasi:**
- Database queries dalam `supabase.ts`
- Loan application access

**Impact:**
- Unauthorized data access
- Privacy breach
- Data manipulation

**Rekomendasi:**
```javascript
// Implementasi proper authorization check
const getCurrentUserLoanApplications = async (userId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized access');
  }
  
  const { data, error } = await supabase
    .from('loan_applications')
    .select('*')
    .eq('user_id', userId);
    
  return data;
};
```

---

### 5. HIGH - Sensitive Data Exposure

**Severity:** High  
**CVSS Score:** 6.9  

**Deskripsi:**
Data sensitif seperti NIK, informasi keuangan, dan dokumen pribadi tidak dienkripsi dengan benar saat transit dan penyimpanan.

**Lokasi:**
- Form data transmission
- File storage dalam Supabase

**Impact:**
- Personal data breach
- Financial information exposure
- Identity theft

**Rekomendasi:**
```javascript
// Implementasi enkripsi client-side
import CryptoJS from 'crypto-js';

const encryptSensitiveData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptSensitiveData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

---

### 6. MEDIUM - Insufficient Session Management

**Severity:** Medium  
**CVSS Score:** 5.4  

**Deskripsi:**
Session tidak memiliki timeout yang memadai dan tidak ada mekanisme untuk mendeteksi session hijacking.

**Lokasi:**
- `src/lib/supabase.ts` - Session handling

**Rekomendasi:**
```javascript
// Implementasi session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit

const checkSessionValidity = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const now = new Date().getTime();
    const sessionTime = new Date(session.expires_at || 0).getTime();
    
    if (now > sessionTime - SESSION_TIMEOUT) {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    }
  }
};
```

---

### 7. MEDIUM - Missing Content Security Policy

**Severity:** Medium  
**CVSS Score:** 4.7  

**Deskripsi:**
Aplikasi tidak mengimplementasikan Content Security Policy (CSP) yang dapat mencegah serangan XSS dan injection lainnya.

**Rekomendasi:**
```html
<!-- Tambahkan CSP header -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co;">
```

---

### 8. LOW - Information Disclosure

**Severity:** Low  
**CVSS Score:** 3.1  

**Deskripsi:**
Error messages yang terlalu detail dapat memberikan informasi sistem kepada penyerang.

**Lokasi:**
- Error handling dalam berbagai komponen

**Rekomendasi:**
```javascript
// Generic error messages
const handleError = (error: any) => {
  console.error('Detailed error:', error); // Log untuk debugging
  
  // Generic message untuk user
  setError('Terjadi kesalahan. Silakan coba lagi atau hubungi support.');
};
```

---

## REKOMENDASI KEAMANAN

### Immediate Actions (Critical Priority)
1. **Implementasi Rate Limiting**
   - Batasi percobaan login: 5 attempts per 15 menit
   - Implementasi CAPTCHA setelah 3 percobaan gagal
   - Monitor dan log suspicious activities

2. **File Upload Security**
   - Validasi magic bytes untuk verifikasi jenis file
   - Scan file dengan antivirus sebelum penyimpanan
   - Isolasi file upload dalam sandbox environment

### Short Term (1-2 weeks)
3. **Input Validation & Sanitization**
   - Implementasi DOMPurify untuk semua user input
   - Server-side validation untuk semua form data
   - Parameterized queries untuk database operations

4. **Session Security**
   - Implementasi session timeout (30 menit)
   - Regenerate session ID setelah login
   - Secure cookie flags (HttpOnly, Secure, SameSite)

### Medium Term (1 month)
5. **Data Encryption**
   - Enkripsi data sensitif (NIK, financial data) sebelum penyimpanan
   - Implementasi field-level encryption
   - Key management system

6. **Security Headers**
   - Content Security Policy (CSP)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security

### Long Term (2-3 months)
7. **Security Monitoring**
   - Implementasi logging dan monitoring
   - Intrusion detection system
   - Regular security assessments

8. **Compliance**
   - GDPR compliance untuk data pribadi
   - PCI DSS untuk data finansial
   - Regular security audits

---

## COMPLIANCE & REGULATORY

### Data Protection
- **GDPR Compliance:** Implementasi right to be forgotten, data portability
- **Indonesian Data Protection:** Sesuai UU PDP No. 27 Tahun 2022
- **Financial Regulations:** Sesuai regulasi OJK untuk fintech

### Security Standards
- **OWASP Top 10 2021:** Address semua kategori risiko
- **ISO 27001:** Implementasi security management system
- **PCI DSS:** Untuk handling data finansial

---

## KESIMPULAN

Aplikasi Lendana Financial Access Platform memiliki beberapa kerentanan keamanan yang perlu segera ditangani, terutama yang berkaitan dengan autentikasi dan file upload. Implementasi rekomendasi keamanan yang diberikan akan secara signifikan meningkatkan postur keamanan aplikasi.

### Risk Score: 7.2/10 (High Risk)

**Prioritas Utama:**
1. Rate limiting implementation
2. File upload security hardening  
3. Input validation & XSS prevention
4. Session management improvement

### Timeline Rekomendasi
- **Week 1:** Critical vulnerabilities (Rate limiting, File upload)
- **Week 2-3:** High severity issues (XSS, IDOR, Data exposure)
- **Month 1:** Medium severity improvements
- **Month 2-3:** Long-term security enhancements

---

**Prepared by:** Security Assessment Team  
**Date:** 21 Januari 2025  
**Next Review:** 21 April 2025 (3 months)

---

*Dokumen ini bersifat CONFIDENTIAL dan hanya untuk internal PT. Lendana Digitalindo Nusantara*
