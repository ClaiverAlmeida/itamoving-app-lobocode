/**
 * Push Notifications: permissão nativa do navegador, registro de subscription e envio ao backend.
 * WebSocket só é conectado se o usuário aceitar as notificações.
 */

import { api } from './api.service';

const SW_PATH = '/sw.js';

export type NotificationPermission = 'granted' | 'denied' | 'default';

export const pushService = {
  /** Verifica se Push e Service Worker são suportados */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  },

  /** Retorna o estado atual da permissão */
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window))
      return 'default';
    return (Notification.permission as NotificationPermission) ?? 'default';
  },

  /**
   * Mostra o prompt nativo do navegador para permitir notificações.
   * Resolve com 'granted' ou 'denied' (ou 'default' se já tiver sido dispensado).
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    if (Notification.permission !== 'default') {
      return Notification.permission as NotificationPermission;
    }
    const result = await Notification.requestPermission();
    return result as NotificationPermission;
  },

  /** Busca a chave pública VAPID no backend (requer usuário logado). */
  async getVapidPublicKey(): Promise<string | null> {
    const res = await api.get<{ publicKey?: string }>(
      '/notifications/push/vapid-public-key',
      { useCache: false }
    );
    const key = (res.data as { publicKey?: string } | undefined)?.publicKey;
    return key && key.length > 0 ? key : null;
  },

  /** Converte VAPID public key (base64url) para Uint8Array para o PushManager */
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  /** ArrayBuffer para base64url (para chaves p256dh e auth) */
  arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  /**
   * Registra o Service Worker e inscreve no Push; envia a subscription ao backend.
   * Só chamar após permissão 'granted'.
   */
  async registerAndSubscribe(): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }
    try {
      const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
      await reg.update();
      const vapidKey = await this.getVapidPublicKey();
      if (!vapidKey) {
        console.warn('[Push] VAPID public key não disponível no backend.');
        return false;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey),
      });
      const p256dh = sub.getKey('p256dh');
      const auth = sub.getKey('auth');
      if (!p256dh || !auth) {
        console.warn('[Push] Subscription sem chaves.');
        return false;
      }
      const payload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64Url(p256dh),
          auth: this.arrayBufferToBase64Url(auth),
        },
      };
      await api.post('/notifications/push/subscribe', payload);
      return true;
    } catch (e) {
      console.error('[Push] Erro ao registrar/subscribir:', e);
      return false;
    }
  },
};
