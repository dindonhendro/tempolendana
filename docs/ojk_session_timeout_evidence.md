# Dokumen Bukti Implementasi: *Session Timeout* (Batas Waktu Sesi)

**Tujuan:** Memenuhi persyaratan keamanan (Security Compliance) dari Otoritas Jasa Keuangan (OJK) yang mewajibkan penghentian sesi otomatis jika pengguna tidak aktif (*idle*) selama 10 menit.
**Sistem:** Lendana Financial Web App
**Tanggal Dokumen:** 12 Maret 2026

---

## 1. Deskripsi Fitur
Sistem telah dilengkapi dengan mekanisme pemutusan sesi otomatis (Session Timeout). Mekanisme ini terus merekam aktivitas pengguna pada peramban web (seperti pergerakan *mouse*, klik, dan sentuhan *keyboard*). Jika sistem tidak mendeteksi interaksi sama sekali selama **10 menit (600.000 milidetik)**, sistem akan secara proaktif:
1. Membatalkan (mencabut) token otentikasi sesi melalui layanan *backend* (Supabase).
2. Menghapus status *login* lokal dari memori *browser*.
3. Mengalihkan (Redirect) pengguna kembali ke halaman Login dengan alasan batas waktu terlampaui.

## 2. Bukti Implementasi Kode (Source Code Evidence)

### A. Modul `useSessionTimeout.ts` (Event Listener & Timer)
Sistem menggunakan *React Hook* kustom untuk melacak aktivitas di level aplikasi (global).

```typescript
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 menit (dalam satuan ms)

export const useSessionTimeout = (isAuthenticated: boolean) => {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      // 1. Cabut token dari sisi server
      await supabase.auth.signOut();
      // 2. Refresh browser secara paksa agar sisa data terhapus dari memori
      window.location.href = '/login?reason=timeout';
    } catch (error) {
      console.error('Error logging out due to inactivity:', error);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Hanya mengatur timer jika pengguna sedang masuk (terotentikasi)
    if (isAuthenticated) {
      timerRef.current = setTimeout(handleLogout, SESSION_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    // Array aksi yang mendefinisikan "aktivitas pengguna"
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    if (isAuthenticated) {
      // Set timer awal saat komponen dimuat
      resetTimer();

      // Mendaftarkan event listener pada browser
      events.forEach((event) => {
        window.addEventListener(event, handleActivity, { passive: true });
      });
    }

    return () => {
      // Membersihkan timer dan event listener saat sesi dihapus/tidak aktif (Garbage Collector)
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);
};
```

### B. Integrasi pada Aplikasi Utama (`src/App.tsx`)
Modul pemantau sesi aktif dihidupkan pada akar dari aplikasi sehingga fitur pengawasan berjalan secara universal di semua laman portal pengguna, admin, maupun validator.

```typescript
import { useSessionTimeout } from "./hooks/useSessionTimeout";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Memicu sistem Session Timeout hanya saat user memiliki status terautentikasi
  useSessionTimeout(!!user && authInitialized);
  
  // -- Blok kode lainnya untuk memuat (render) UI dasbor --
}
```

## 3. Hasil Pengujian Sistem
- **Kondisi Pengujian 1**: Akses Dashboard Admin, membiarkan posisi *idle* (tanpa interaksi *mouse/keyboard*) selama 10 menit 1 detik.
  - **Hasil yang diharapkan:** Sesi dihentikan, token dihapus dari Storage API, user dilontarkan kembali ke antarmuka login.
  - **Hasil aktual:** Berhasil, Sesuai Kriteria Pengujian OJK.
- **Kondisi Pengujian 2**: Aktif mengklik laman atau input *keyboard* untuk mengubah formulir, memantau *setTimeout delay* reset.
  - **Hasil yang diharapkan**: *Timer Timeout* direset otomatis menjadi 10 menit dari waktu aksi tersebut, sehingga tidak di-*logout* secara acak di tengah pekerjaan.
  - **Hasil aktual:** Berhasil. Timer ter-*reset* secara konsisten setiap kali event `[mousemove, scroll, keydown]` memanggil fungsi `resetTimer()`.

## 4. Kesimpulan
Sistem penghentian batas waktu tidak aktif (*Session Timeout Inactivity*) pada Lencana Web Apps telah dikembangkan, diterapkan ke lingkungan *production*, serta beroperasi normal sepenuhnya mematuhi tenggat wajib *timeout* sesi maksimal **10 menit** dari OJK.
