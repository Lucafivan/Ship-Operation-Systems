#!/bin/bash
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
# Tunggu sampai DB bisa di-ping
until nc -z db 5432; do
  sleep 1
done

echo " Database is ready! Running migrations..."

# Jalankan migrasi setiap kali container start (aman)
flask db upgrade || true

# Jalankan clean-db & seed hanya sekali (kalau belum pernah)
if [ ! -f /app/.initialized ]; then
  echo " First-time setup: cleaning & seeding database..."
  flask clean-db || true
  flask seed || true
  touch /app/.initialized
else
  echo " Database already initialized — skipping clean & seed."
fi

echo "[START] Starting Flask app..."
exec python run.py