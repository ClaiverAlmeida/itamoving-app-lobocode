import axios, { type AxiosInstance } from 'axios';
import type { ApiOptions, ApiResponse } from '../types';
import { API_BASE_URL } from '../config';

class ApiService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private cache = new Map<string, { data: unknown; timestamp: number; expiresAt: number }>();
  private loadingStates = new Map<string, boolean>();

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;
          try {
            const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refresh_token') : null;
            if (refreshToken) {
              const response = await this.axiosInstance.post<{
                access_token: string;
                refresh_token: string;
              }>('/auth/refresh', { refreshToken });
              const { access_token, refresh_token } = response.data;
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('auth_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
              }
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.axiosInstance(originalRequest);
            }
          } catch {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('itamoving_user');
            }
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const cacheKey = options.cacheKey ?? `GET:${endpoint}:${JSON.stringify(options.params ?? {})}`;
    if (options.useCache !== false) {
      const entry = this.cache.get(cacheKey);
      if (entry && Date.now() < entry.expiresAt) {
        return { success: true, data: entry.data as T };
      }
    }
    if (options.showLoader !== false) this.loadingStates.set(cacheKey, true);
    try {
      const response = await this.axiosInstance.get<T>(endpoint, {
        params: options.params,
        headers: options.headers,
      });
      const data = response.data;
      if (options.useCache !== false) {
        const ttl = options.cacheTtl ?? 5 * 60 * 1000;
        this.cache.set(cacheKey, { data, timestamp: Date.now(), expiresAt: Date.now() + ttl });
      }
      return { success: true, data };
    } catch (err: unknown) {
      return this.handleError<T>(err);
    } finally {
      if (options.showLoader !== false) this.loadingStates.delete(cacheKey);
    }
  }

  async post<T = unknown>(endpoint: string, body: unknown, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const key = `POST:${endpoint}`;
    if (options.showLoader !== false) this.loadingStates.set(key, true);
    try {
      const response = await this.axiosInstance.post<T>(endpoint, body, { headers: options.headers });
      this.invalidateCache(endpoint);
      return { success: true, data: response.data };
    } catch (err: unknown) {
      return this.handleError<T>(err);
    } finally {
      if (options.showLoader !== false) this.loadingStates.delete(key);
    }
  }

  async patch<T = unknown>(endpoint: string, body: unknown, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const key = `PATCH:${endpoint}`;
    if (options.showLoader !== false) this.loadingStates.set(key, true);
    try {
      const response = await this.axiosInstance.patch<T>(endpoint, body, { headers: options.headers });
      this.invalidateCache(endpoint);
      return { success: true, data: response.data };
    } catch (err: unknown) {
      return this.handleError<T>(err);
    } finally {
      if (options.showLoader !== false) this.loadingStates.delete(key);
    }
  }

  async put<T = unknown>(endpoint: string, body: unknown = {}, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const key = `PUT:${endpoint}`;
    if (options.showLoader !== false) this.loadingStates.set(key, true);
    try {
      const response = await this.axiosInstance.put<T>(endpoint, body, { headers: options.headers });
      this.invalidateCache(endpoint);
      return { success: true, data: response.data };
    } catch (err: unknown) {
      return this.handleError<T>(err);
    } finally {
      if (options.showLoader !== false) this.loadingStates.delete(key);
    }
  }

  async delete<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const key = `DELETE:${endpoint}`;
    if (options.showLoader !== false) this.loadingStates.set(key, true);
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, { headers: options.headers });
      this.invalidateCache(endpoint);
      return { success: true, data: response.data };
    } catch (err: unknown) {
      return this.handleError<T>(err);
    } finally {
      if (options.showLoader !== false) this.loadingStates.delete(key);
    }
  }

  private invalidateCache(endpoint: string): void {
    const resource = endpoint.split('/')[0];
    for (const key of this.cache.keys()) {
      if (key.startsWith('GET:') && key.includes(resource)) this.cache.delete(key);
    }
  }

  private handleError<T = unknown>(error: unknown): ApiResponse<T> {
    let message = 'Erro desconhecido';
    if (error && typeof error === 'object' && 'response' in error) {
      const res = (error as { response?: { data?: { message?: string | string[]; error?: string }; status?: number } }).response;
      const msg = res?.data?.message ?? res?.data?.error;
      if (msg) message = Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : String(msg);
      else if (res?.status === 401) message = 'Não autorizado';
      else if (res?.status === 403) message = 'Acesso negado';
      else if (res?.status === 404) message = 'Recurso não encontrado';
      else if (res?.status === 422) message = 'Dados inválidos';
    } else if (error && typeof error === 'object' && 'request' in error) {
      message = 'Erro de conexão';
    }
    return { success: false, error: message };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const api = new ApiService();
