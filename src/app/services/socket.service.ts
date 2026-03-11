import { io, type Socket } from 'socket.io-client';

const getApiBaseUrl = (): string => {
  try {
    const env = (import.meta as { env?: { VITE_API_URL?: string; PROD?: boolean } }).env;
    if (env?.VITE_API_URL) return env.VITE_API_URL;
    if (env?.PROD) return 'https://api.itamoving.com.br';
  } catch {
    // ignore
  }
  return 'http://localhost:30100';
};

const API_BASE_URL = getApiBaseUrl();

const PING_INTERVAL_MS = 10_000;
const PING_LOG_PREFIX = '[WebSocket]';

let socket: Socket | null = null;
let pingIntervalId: ReturnType<typeof setInterval> | null = null;

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function startPingPong(sock: Socket) {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }

  sock.on('pong', (data: { timestamp?: number }) => {
    console.log(
      `${PING_LOG_PREFIX} 🏓 PONG recebido`,
      data?.timestamp ? `(envio: ${new Date(data.timestamp).toISOString()})` : ''
    );
  });

  pingIntervalId = setInterval(() => {
    if (sock.connected) {
      console.log(`${PING_LOG_PREFIX} 🏓 PING enviado`);
      sock.emit('ping');
    }
  }, PING_INTERVAL_MS);
}

function stopPingPong() {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
}

/**
 * Conecta ao Gateway WebSocket do backend (notificações).
 * Usa o token em localStorage (auth_token). Ping/pong é logado no console para testes.
 */
export function connectSocket(): Socket | null {
  const token = getToken();
  if (!token) {
    console.warn(`${PING_LOG_PREFIX} Token não encontrado, não é possível conectar.`);
    return null;
  }

  if (socket?.connected) {
    console.log(`${PING_LOG_PREFIX} Já conectado.`);
    return socket;
  }

  socket = io(API_BASE_URL, {
    path: '/socket.io',
    auth: { authorization: `Bearer ${token}` },
    query: { token },
    extraHeaders: { Authorization: `Bearer ${token}` },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(`${PING_LOG_PREFIX} ✅ Conectado - id:`, socket?.id);
    startPingPong(socket!);
  });

  socket.on('disconnect', (reason) => {
    console.log(`${PING_LOG_PREFIX} ❌ Desconectado:`, reason);
    stopPingPong();
  });

  socket.on('connect_error', (err) => {
    console.error(`${PING_LOG_PREFIX} Erro de conexão:`, err.message);
    stopPingPong();
  });

  return socket;
}

/**
 * Desconecta e limpa o socket.
 */
export function disconnectSocket() {
  stopPingPong();
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  console.log(`${PING_LOG_PREFIX} Desconectado manualmente.`);
}

/**
 * Retorna a instância do socket se estiver conectado (para escutar eventos como new_notification).
 */
export function getSocket(): Socket | null {
  return socket?.connected ? socket : null;
}
