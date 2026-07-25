# Desain Sistem Backup Cloud-Based (Supabase Edge Function)

Dokumen ini menjelaskan rancangan arsitektur dan langkah-langkah implementasi untuk melakukan backup database secara semi-otomatis melalui tombol **"Backup Database"** di Dasbor Admin, menggunakan **Supabase Edge Functions** dan **Supabase Storage**.

---

## 1. Arsitektur Sistem

Alur kerja dari sistem backup ini digambarkan sebagai berikut:

```
[ Admin Dashboard (React) ]
          │
          │ (HTTP POST dengan Auth JWT)
          ▼
[ Supabase Edge Function (Deno) ]
          │
          ├─► 1. Query Data ke PostgreSQL (via Service Role Key)
          ├─► 2. Formatisasi Data ke JSON / CSV (Gzip Kompresi)
          │
          ▼ (Upload Binary/Teks)
[ Supabase Storage Bucket ('backups') ]
```

---

## 2. Kebutuhan Komponen & Keamanan

### A. Supabase Storage Bucket (`backups`)
* Membuat bucket privat bernama `backups` untuk menyimpan file cadangan.
* Mengaktifkan kebijakan RLS (Row Level Security) agar bucket hanya dapat dibaca/ditulis oleh sistem internal (Edge Function) dan Admin yang terautentikasi.

### B. Supabase Edge Function (`backup-database`)
* Ditulis menggunakan runtime **Deno** (Deno.js).
* Berjalan di serverless infrastructure Supabase, sehingga dapat digunakan baik di tahap *development* maupun *production*.
* Menggunakan **Service Role Key** Supabase secara aman di sisi server untuk melakukan query data tanpa terhalang RLS user biasa.

### C. Keamanan Akses
* Endpoint Edge Function wajib memvalidasi token JWT pengguna:
  * Memastikan pengguna memiliki sesi aktif.
  * Memastikan pengguna memiliki role `admin`.
  * Menolak request dari pihak luar/pengguna non-admin secara langsung.

---

## 3. Langkah-Langkah Implementasi

### Langkah 1: Membuat Storage Bucket
1. Masuk ke Supabase Dashboard.
2. Navigasi ke menu **Storage** > **New Bucket**.
3. Beri nama bucket: `backups`.
4. Atur status bucket menjadi **Private** (tidak dapat diakses publik).

---

### Langkah 2: Membuat & Menulis Edge Function
Di komputer lokal Anda, buat fungsi baru menggunakan Supabase CLI:
```bash
supabase functions new backup-database
```

Tulis logika cadangan data di dalam `supabase/functions/backup-database/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validasi Auth & Authorization (Role Admin)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ambil detail role dari metadata
    const userRole = user.user_metadata?.role || 'user'
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Klien Database dengan Akses Admin (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Query Data Penting (Aplikasi Pinjaman, Pengguna, Profil Agen, dll.)
    const { data: applications, error: dbError } = await supabaseAdmin
      .from('loan_applications')
      .select('*')

    if (dbError) throw dbError

    // 4. Konversi Data ke format JSON String
    const backupData = JSON.stringify({
      timestamp: new Date().toISOString(),
      generator: user.email,
      data: {
        loan_applications: applications
      }
    }, null, 2)

    // 5. Upload File Backup ke Supabase Storage Bucket
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `backup_lendana_${timestamp}.json`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('backups')
      .upload(fileName, new Blob([backupData], { type: 'application/json' }), {
        contentType: 'application/json',
        upsert: false
      })

    if (uploadError) throw uploadError

    return new Response(
      JSON.stringify({ 
        message: 'Backup database berhasil diselesaikan!', 
        fileName, 
        bucket: 'backups' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

---

### Langkah 3: Deploy Edge Function ke Cloud
Jalankan perintah berikut untuk mengunggah fungsi ke Supabase Cloud:
```bash
supabase functions deploy backup-database
```

---

### Langkah 4: Hubungkan ke Dashboard Admin (Frontend)
Di halaman dasbor Admin Anda, tambahkan tombol dan logika pemicu berikut:

```typescript
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [backingUp, setBackingUp] = useState(false);

  const triggerCloudBackup = async () => {
    setBackingUp(true);
    try {
      // Ambil session saat ini untuk token JWT
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        return;
      }

      // Memanggil Edge Function via HTTP POST
      const response = await fetch(
        "https://ptdjmsekjzkmmyrxfkgm.supabase.co/functions/v1/backup-database",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memproses backup.");
      }

      alert(`Sukses! File backup "${result.fileName}" berhasil dibuat di storage.`);
    } catch (error: any) {
      console.error("Backup error:", error);
      alert(`Terjadi kesalahan saat membackup: ${error.message}`);
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <Button 
      onClick={triggerCloudBackup} 
      disabled={backingUp}
      className="bg-blue-600 text-white hover:bg-blue-700"
    >
      {backingUp ? "Sedang Membackup..." : "Backup Database ke Cloud"}
    </Button>
  );
}
```

---

## 4. Kelebihan & Kekurangan Cara Ini

### Kelebihan:
1. **Akses Universal**: Tombol backup dapat diakses dari mana saja (selama admin login di browser), tidak terikat harus di komputer lokal pengembang.
2. **Keamanan Tinggi**: Dilindungi oleh Supabase Auth JWT. Kunci rahasia database (`Service Role Key`) tidak pernah dikirim ke browser (aman di serverless).
3. **Penyimpanan Terpusat**: File backup langsung terorganisir di Supabase Storage (bisa diunduh oleh admin kapan saja).

### Kekurangan:
1. **Bukan File Postgres `.dump` Biner**: Output-nya adalah file `.json` (atau `.csv`), bukan dump biner terkompresi Postgres asli. Untuk merestore data, Anda memerlukan script import JSON ke tabel terkait, bukan sekadar `pg_restore`.
2. **Keterbatasan Payload**: Supabase Edge Functions memiliki memori maksimal (biasanya 150MB-256MB) dan timeout 150 detik. Jika data transaksi Lendana di masa depan bertambah hingga jutaan baris, cara ini berisiko kehabisan memori. (Cocok untuk skala kecil/menengah).
