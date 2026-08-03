#!/bin/bash
set -e

echo "Aguardando banco de dados..."
while ! nc -z "${DB_HOST}" "${DB_PORT}"; do
  sleep 1
done
echo "Banco de dados disponível."

echo "Inicializando banco de dados..."
cd /app
python insert_inital_data.py

echo "Iniciando API..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips "*"
