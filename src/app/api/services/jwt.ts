/**
 * Decodifica o payload do JWT (apenas leitura; a assinatura só é validada no servidor).
 * Uso no cliente para hidratar UI a partir do token emitido no login/refresh — não substitui GET /auth/me para role definitiva.
 */
import type { JwtPayload } from '../types';

export function getUserFromToken(token: string): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padding = payload.length % 4;
    const base64 = padding ? payload + '='.repeat(4 - padding) : payload;
    const decoded = atob(base64);
    const utf8Decoded = decodeURIComponent(
      decoded.split('').map((c) => {
        const codePoint = c.codePointAt(0) ?? 0;
        return '%' + ('00' + codePoint.toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(utf8Decoded) as JwtPayload;
  } catch {
    return null;
  }
}
