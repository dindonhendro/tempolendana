# Production Deployment Guide – Vite TypeScript Web App with Self-Hosted Supabase

## 1. Overview

Aplikasi ini menggunakan arsitektur sebagai berikut:

- **Frontend:** Vite dengan TypeScript sebagai framework modern untuk pengembangan web yang cepat dan efisien.
- **Backend Data:** Pada tahap development menggunakan Supabase Cloud, sedangkan untuk production bermigrasi ke Self-Hosted Supabase.

### Alasan Migrasi ke Self-Hosted Supabase

Migrasi dilakukan untuk memenuhi kebutuhan kontrol penuh atas data dan layanan, kepatuhan terhadap regulasi OJK, serta keamanan data dengan enkripsi saat penyimpanan (encryption at rest). Self-hosted Supabase memberikan fleksibilitas dan compliance yang tidak dapat dipenuhi oleh layanan cloud publik.

---

## 2. Project Structure

Struktur folder minimal proyek adalah sebagai berikut:

```
/src
  /components
  /pages
  /lib/supabase
  /types
/vite.config.ts
/index.html
```

---

## 3. Local Development Setup (Supabase Cloud)

Untuk pengembangan lokal, gunakan Supabase Cloud dengan URL dan public anon key.

### Format `.env.development`

```
VITE_SUPABASE_URL=<cloud-url>
VITE_SUPABASE_ANON_KEY=<cloud-anon-key>
```

### Perintah Menjalankan

```bash
npm install
npm run dev
```

---

## 4. Self-Hosted Supabase Production Setup

### 4.1 Install Supabase Self-Hosted

Gunakan Docker Compose untuk instalasi:

```bash
supabase init
supabase start
```

Pastikan service eksternal berikut berjalan:

- kong
- studio
- auth
- storage
- real-time
- postgres

### 4.2 Konfigurasi Domain & Port

Contoh URL production Supabase:

```
SUPABASE_URL=http://lendana.co.id:8000
```

### 4.3 Konfigurasi Environment Variables

Masukkan ke `.env.production`:

```
VITE_SUPABASE_URL=http://lendana.co.id:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

---

## 5. Environment Switching (Dev → Prod)

Buat file `.env.production`, `.env.development`, dan loader environment.

Vite hanya membaca environment variables yang diawali dengan prefix `VITE_`.

### Contoh `vite.config.ts`

```typescript
import { defineConfig, loadEnv } from "vite";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    define: {
      __SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  });
};
```

---

## 6. Supabase Client Initialization

File: `/src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  __SUPABASE_URL__,
  __SUPABASE_ANON_KEY__
);
```

---

## 7. Build Command for Production

Jalankan perintah build:

```bash
npm run build
```

Output berupa folder `dist/` siap untuk dideploy ke server seperti Nginx, Cloudflare Pages, Netlify, dan lain-lain.

---

## 8. Deploying Frontend to Production Server

### Langkah-langkah:

1. Upload folder `dist` ke server produksi.
2. Konfigurasi Nginx untuk SPA Vite:

```nginx
location / {
  try_files $uri /index.html;
}
```

3. Restart Nginx:

```bash
sudo systemctl restart nginx
```

---

## 9. Post-Deployment Verification Checklist

- Pastikan API Supabase dapat diakses.
- Fungsi signup dan login auth berjalan dengan baik.
- Row Level Security (RLS) aktif dan aman.
- Upload storage berfungsi.
- CORS pada Supabase self-hosted mengizinkan:

```
Access-Control-Allow-Origin: *
```

---

## 10. Common Production Issues & Fixes

| Masalah                  | Solusi                                                                                  |
|--------------------------|-----------------------------------------------------------------------------------------|
| CORS error               | Pastikan konfigurasi CORS di Supabase mengizinkan origin frontend.                      |
| SSL certificate          | Pasang sertifikat SSL valid pada domain production.                                    |
| Wrong anon key           | Gunakan anon key yang sesuai environment production.                                   |
| Vite env tidak terbaca   | Pastikan prefix `VITE_` pada env variables dan loadEnv dipanggil dengan benar.         |
| Supabase storage 403     | Periksa permission dan policy storage di Supabase.                                     |

---

## 11. Appendix

### Contoh `.env.production`

```
VITE_SUPABASE_URL=http://lendana.co.id:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

### Contoh Konfigurasi Nginx

```nginx
server {
  listen 80;
  server_name lendana.co.id;

  root /var/www/lendana/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

### Contoh Script CI/CD (Opsional)

```bash
# Build dan deploy otomatis
npm install
npm run build
rsync -avz dist/ user@production-server:/var/www/lendana/dist
ssh user@production-server "sudo systemctl restart nginx"
```

---

Dokumentasi ini siap digunakan sebagai panduan internal engineering untuk deployment production aplikasi web Vite TypeScript dengan backend Self-Hosted Supabase.
