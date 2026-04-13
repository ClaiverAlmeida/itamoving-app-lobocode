#!/bin/bash

# Deploy do frontend Itamoving App (Docker produção)
# Portas e rede: alinhado a itamoving-api-lobocode/docs/PORTAS-PADRAO.md e docker-compose.prod da API

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }

cd "$(dirname "$0")/.." || exit 1

CONTAINER_NAME="itamoving-app"
HOST_PORT=3121
DOCKER_NETWORK="app-net-itamoving"

log_info "Verificando container existente..."

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_warning "Container '${CONTAINER_NAME}' já existe. Parando e removendo..."
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    log_success "Container antigo removido"
    sleep 2
fi

if lsof -Pi :"${HOST_PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_error "Porta ${HOST_PORT} ainda está em uso (reservada ao frontend Itamoving no PORTAS-PADRAO)!"
    lsof -Pi :"${HOST_PORT}" -sTCP:LISTEN
    exit 1
fi
log_success "Porta ${HOST_PORT} disponível"

log_info "Serviços Docker em execução:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true

docker network create "${DOCKER_NETWORK}" 2>/dev/null || true

log_info "Construindo imagem Docker (Itamoving App)..."
docker compose -f docker-compose.prod.yml build --no-cache
log_success "Build concluído!"

log_info "Iniciando container..."
docker compose -f docker-compose.prod.yml up -d

log_info "Aguardando container inicializar..."
sleep 5

log_info "Verificando status do container..."

if docker ps | grep -q "${CONTAINER_NAME}"; then
    log_success "Container está rodando!"
    docker logs --tail 20 "${CONTAINER_NAME}" 2>/dev/null || true

    sleep 10
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "no-healthcheck")
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        log_success "Healthcheck: OK"
    elif [ "$HEALTH_STATUS" = "starting" ]; then
        log_warning "Healthcheck: iniciando..."
    else
        log_warning "Healthcheck: $HEALTH_STATUS"
    fi

    echo ""
    echo "======================================================================"
    log_success "Deploy concluído – Itamoving App (frontend)"
    echo "======================================================================"
    echo ""
    echo "📊 Serviço:"
    echo "   - Container: ${CONTAINER_NAME}"
    echo "   - Porta host: ${HOST_PORT} (padrão frontend Itamoving)"
    echo "   - Rede: ${DOCKER_NETWORK}"
    echo "   - URL: http://localhost:${HOST_PORT}"
    echo "   - API produção: https://itamoving-api.lobocode.com.br"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "   - Logs: docker logs -f ${CONTAINER_NAME}"
    echo "   - Parar: docker compose -f docker-compose.prod.yml down"
    echo "   - Reiniciar: docker restart ${CONTAINER_NAME}"
    echo ""
else
    log_error "Container não está rodando!"
    docker logs "${CONTAINER_NAME}" 2>/dev/null || true
    exit 1
fi
