#!/bin/bash

# Script Deployment ke Server Self-Hosted (Zero Downtime)
# Struktur: /var/www/kurpmi/releases/{timestamp} -> /var/www/kurpmi/current

set -e # Hentikan script jika ada error

# --- KONFIGURASI AGENT ---
# Menggunakan host alias dari ~/.ssh/config ('lendana.id')
SERVER_HOST="lendana.id"
BASE_PATH="/home2/u13777gjg/domain/lendana.id/lendana.id"
PROJECT_ROOT="$BASE_PATH/web"
RELEASES_DIR="$BASE_PATH/tempolendana/releases"

# Generate Timestamp untuk nama folder release
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

echo "=============================================="
echo "🚀 Deploying to $SERVER_HOST"
echo "Target Release: $NEW_RELEASE_DIR"
echo "=============================================="

# 1. Build Project Lokal
echo "[1/5] 🏗️  Building project locally..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Error: Direktori 'dist' tidak ditemukan. Build gagal."
  exit 1
fi

# 2. Buat Folder Release di Server
echo "[2/5] 📂 Creating release directory on server..."
ssh $SERVER_HOST "mkdir -p $NEW_RELEASE_DIR"

# 3. Upload File 'dist' ke Server
echo "[3/5] ☁️  Uploading build artifacts..."
# Flag -r untuk rekursif, -z untuk kompresi
# 'dist/' (dengan slash) agar isinya yang masuk ke folder tujuan
rsync -avz --quiet dist/ $SERVER_HOST:$NEW_RELEASE_DIR/

# 4. Update Symlink 'current' (Atomic Switch)
echo "[4/5] 🔗 Switching 'web' symlink..."
# ln -sfn: s=symbolic, f=force, n=no-dereference (atomically update symlink)
ssh $SERVER_HOST "ln -sfn $NEW_RELEASE_DIR $BASE_PATH/web"

# 5. Bersihkan Release Lama (Optional: Keep last 5)
echo "[5/5] 🧹 Cleanup old releases (keeping last 5)..."
ssh $SERVER_HOST "cd $RELEASES_DIR && ls -1t | tail -n +6 | xargs -r rm -rf"

echo "=============================================="
echo "✅ DEPLOYMENT SUCCESS!"
echo "New version live at: https://lendana.id"
echo "=============================================="
