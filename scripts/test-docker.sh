#!/bin/bash

# Teste Docker – Itamoving App (frontend)
cd "$(dirname "$0")/.." || exit 1

echo "🧪 Testando configuração Docker (Itamoving App)..."

echo "Docker version:"
docker --version

echo "Docker Compose version:"
docker compose version

echo "🔨 Testando build..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "✅ Teste concluído. Container: host :3111 → nginx :80 (ver docs/PORTAS-PADRAO.md na API)"
