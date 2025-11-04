#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
# Tunggu sampai DB bisa di-ping
until nc -z db 5432; do
  sleep 1
done

echo "Database is ready! Running migrations and seeding..."

# Jalankan migrasi dan seeder
flask db upgrade || true
flask clean-db || true
flask seed || true

echo "[START] Starting Flask app..."
exec python run.py
