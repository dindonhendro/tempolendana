# Panduan Restore Database dari Backup JSON (Supabase)

Dokumen ini menjelaskan tata cara memulihkan (restore) data database Lendana dari file cadangan `.json` hasil ekspor Supabase Edge Function ke database PostgreSQL Supabase.

---

## 1. Alur Kerja Pemulihan

Karena data disimpan dalam format JSON terstruktur yang mencakup beberapa tabel, proses restore dilakukan dengan membaca file tersebut secara terprogram, mengurai (parse) objek, dan melakukan perintah **`UPSERT`** (Insert atau Update) ke database.

```
[ Unduh File .json dari Storage Bucket 'backups' ]
                       │
                       ▼
[ Jalankan Script Restore (Node.js) di Lokal/Server ]
                       │
                       ├─► 1. Baca & Parse File JSON
                       ├─► 2. Iterasi Tabel Sesuai Urutan Dependensi FK (Foreign Key)
                       │
                       ▼ (Query UPSERT via Service Role Key)
[ Database Supabase (PostgreSQL) ]
```

---

## 2. Langkah-Langkah Pemulihan Data

### Langkah 1: Unduh File Backup JSON
1. Masuk ke **Supabase Dashboard** proyek Anda.
2. Buka menu **Storage** di sidebar kiri.
3. Pilih bucket privat bernama **`backups`**.
4. Cari file cadangan yang ingin Anda pulihkan (berformat `db_backup_lendana_YYYYMMDD_HHMMSS.json`).
5. Klik ikon opsi di kanan file lalu klik **Download** untuk mengunduhnya ke komputer Anda.

### Langkah 2: Buat Script Pemulihan (`restore.cjs`)
Buat file baru di proyek Anda dengan nama `scripts/restore.cjs`. Isi dengan kode di bawah ini:

```javascript
/**
 * scripts/restore.cjs
 * Script pemulihan database Lendana dari format JSON.
 * Menjamin integritas referensi asing (Foreign Key) saat insersi data.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. KONTROL UTAMA: Ganti variabel ini sesuai lingkungan database Anda
const SUPABASE_URL = "https://ptdjmsekjzkmmyrxfkgm.supabase.co";
// WAJIB menggunakan Service Role Key agar mem-bypass RLS (Row Level Security)
const SUPABASE_SERVICE_ROLE_KEY = "Hw_780378..."; // Isi dengan Service Role Key aktif Anda

// Path ke file backup JSON yang diunduh
const BACKUP_FILE_PATH = path.join(__dirname, '../backups/db_backup_lendana_ganti_nama_file.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function startRestore() {
  try {
    if (!fs.existsSync(BACKUP_FILE_PATH)) {
      console.error(`[X] Error: File backup tidak ditemukan di: ${BACKUP_FILE_PATH}`);
      console.error(`    Silakan unduh file backup dari Storage Bucket dan simpan di folder 'backups/'`);
      return;
    }

    console.log("Reading backup file...");
    const fileContent = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
    const backupJson = JSON.parse(fileContent);
    const dbData = backupJson.database;

    // 2. URUTAN TENTATIF PEMULIHAN TABEL
    // Tabel induk (tidak memiliki dependensi FK) wajib di-restore terlebih dahulu,
    // diikuti oleh tabel anak (yang memiliki foreign key ke tabel induk).
    const tablesOrder = [
      'users',
      'agent_companies',
      'agent_staff',
      'banks',
      'bank_branches',
      'bank_products',
      'bank_staff',
      'insurance_companies',
      'insurance_staff',
      'collector_companies',
      'collector_staff',
      'loan_applications',      // Memiliki FK ke users, banks, agents
      'insurance_assignments',   // Memiliki FK ke loan_applications
      'collector_assignments',   // Memiliki FK ke loan_applications
      'support_tickets',
      'audit_logs',
      'consent_logs'
    ];

    console.log("\n==================================================");
    console.log("       MEMULAI PROSES RESTORE DATABASE LENDANA      ");
    console.log("==================================================");
    console.log(`Tanggal Backup   : ${backupJson.timestamp}`);
    console.log(`Pemicu Backup    : ${backupJson.triggered_by}`);
    console.log(`Ukuran Payload   : ${fileContent.length} bytes`);
    console.log("--------------------------------------------------\n");

    for (const tableName of tablesOrder) {
      const records = dbData[tableName];
      
      if (!records || records.error) {
        console.log(`[-] Tabel [${tableName}] dilewati (tidak ada data / terjadi error saat backup).`);
        continue;
      }

      if (records.length === 0) {
        console.log(`[i] Tabel [${tableName}] kosong (tidak ada baris untuk dipulihkan).`);
        continue;
      }

      console.log(`[*] Memulihkan ${records.length} data ke tabel [${tableName}]...`);

      // Menggunakan upsert untuk mencegah error duplicate key.
      // Jika ID sudah ada di tabel, row data akan diperbarui (update).
      // Jika ID belum ada, row baru akan ditambahkan (insert).
      const { error } = await supabase
        .from(tableName)
        .upsert(records, { onConflict: 'id' });

      if (error) {
        console.error(`[X] GAGAL memulihkan tabel [${tableName}]:`, error.message);
      } else {
        console.log(`[V] Tabel [${tableName}] SUKSES dipulihkan.`);
      }
    }

    console.log("\n==================================================");
    console.log("        PROSES PEMULIHAN SELESAI DENGAN SUKSES       ");
    console.log("==================================================");

  } catch (err) {
    console.error(`\n[X] Terjadi kesalahan fatal:`, err.message || err);
  }
}

startRestore();
```

### Langkah 3: Jalankan Script Pemulihan
1. Simpan file backup JSON yang diunduh ke folder `backups/` di root proyek Anda.
2. Edit file `scripts/restore.cjs` Anda:
   * Ubah konstanta `BACKUP_FILE_PATH` agar mengarah ke nama file backup yang tepat.
   * Ganti `SUPABASE_SERVICE_ROLE_KEY` dengan Service Role Key proyek Supabase Anda.
3. Jalankan script menggunakan Node.js di terminal:
   ```bash
   node scripts/restore.cjs
   ```

---

## 3. Best Practices & Keamanan

* **Gunakan Service Role Key**: Proses pemulihan ini harus melewati kebijakan RLS (Row Level Security). Oleh karena itu, Anda harus menggunakan `Service Role Key` (bukan Anon Key).
* **Keamanan Kredensial**: **SANGAT PENTING!** Jangan pernah mengunggah Service Role Key ke repositori publik (seperti GitHub). Selalu simpan kunci rahasia ini di file lokal atau `.env` lokal Anda.
* **Lakukan Uji Coba Secara Berkala**: Untuk memastikan kepatuhan regulasi OJK (DRC Drill), lakukan uji restore minimal satu kali dalam setahun di server/database uji coba terpisah.
