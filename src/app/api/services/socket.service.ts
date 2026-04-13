import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './auth-storage';

const getApiBaseUrl = (): string => {
  try {
    const env = (import.meta as { env?: { VITE_API_URL?: string; PROD?: boolean } }).env;
    if (env?.VITE_API_URL) return env.VITE_API_URL;
    if (env?.PROD) return 'https://itamoving-api.lobocode.com.br';
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
const onConnectCallbacks = new Set<() => void>();

function getToken(): string | null {
  return getAccessToken();
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

  // pingIntervalId = setInterval(() => {
  //   if (sock.connected) {
  //     console.log(`${PING_LOG_PREFIX} 🏓 PING enviado`);
  //     sock.emit('ping');
  //   }
  // }, PING_INTERVAL_MS);
}

function stopPingPong() {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
}

/**
 * Conecta ao Gateway WebSocket do backend (notificações).
 * Reutiliza a mesma instância se já existir (evita múltiplas conexões ao recarregar/Strict Mode).
 */
export function connectSocket(): Socket | null {
  const token = getToken();
  if (!token) {
    console.warn(`${PING_LOG_PREFIX} Token não encontrado, não é possível conectar.`);
    return null;
  }

  if (socket) {
    if (socket.connected) {
      console.log(`${PING_LOG_PREFIX} Já conectado - id:`, socket.id);
    }
    return socket;
  }

  const sock = io(API_BASE_URL, {
    path: '/socket.io',
    auth: { authorization: `Bearer ${token}` },
    query: { token },
    extraHeaders: { Authorization: `Bearer ${token}` },
    transports: ['websocket', 'polling'],
  });
  socket = sock;

  sock.on('connect', () => {
    console.log(`${PING_LOG_PREFIX} ✅ Conectado - id:`, sock.id);
    startPingPong(sock);
    onConnectCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.warn(`${PING_LOG_PREFIX} onConnect callback error:`, e);
      }
    });
  });

  sock.on('disconnect', (reason) => {
    console.log(`${PING_LOG_PREFIX} ❌ Desconectado:`, reason);
    stopPingPong();
  });

  sock.on('connect_error', (err) => {
    console.error(`${PING_LOG_PREFIX} Erro de conexão com o servidor:`, err.message);
    stopPingPong();
  });

  return sock;
}

/**
 * Desconecta e limpa o socket.
 */
export function disconnectSocket() {
  stopPingPong();
  onConnectCallbacks.clear();
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  console.log(`${PING_LOG_PREFIX} Desconectado manualmente.`);
}

/**
 * Chama o callback quando o socket estiver conectado (ou imediatamente se já estiver).
 * Útil para refresh de notificações/contador após conexão (evita id null → valor).
 * Retorna função para cancelar a inscrição.
 */
export function onceConnected(callback: () => void): () => void {
  if (socket?.connected) {
    try {
      callback();
    } catch (e) {
      console.warn(`${PING_LOG_PREFIX} onceConnected callback error:`, e);
    }
    return () => {};
  }
  onConnectCallbacks.add(callback);
  return () => {
    onConnectCallbacks.delete(callback);
  };
}

/**
 * Retorna a instância do socket (conectado ou ainda conectando).
 * Use para inscrever em eventos; os listeners receberão dados quando o socket estiver conectado.
 */
export function getSocket(): Socket | null {
  return socket ?? null;
}
