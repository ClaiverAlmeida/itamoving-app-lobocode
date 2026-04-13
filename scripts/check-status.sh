#!/bin/bash

# Status do frontend Itamoving App (Docker)
cd "$(dirname "$0")/.." || exit 1

HOST_PORT=3121

echo "🔍 Status – Itamoving App (frontend)..."

echo "📦 Containers:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Conectividade (porta ${HOST_PORT}, padrão PORTAS-PADRAO):"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${HOST_PORT}" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo "   OK - HTTP $HTTP_CODE"
else
    echo "   ❌ Resposta: HTTP $HTTP_CODE (ou app não está respondendo)"
fi

echo ""
echo "📋 Logs recentes:"
docker compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "🔧 Comandos úteis:"
echo "   - Logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   - Parar: docker compose -f docker-compose.prod.yml down"
echo "   - Reiniciar: docker compose -f docker-compose.prod.yml restart"
echo "   - Acessar: http://localhost:${HOST_PORT}"
