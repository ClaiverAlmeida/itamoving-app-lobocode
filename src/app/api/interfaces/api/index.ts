export interface ApiOptions {
  showLoader?: boolean;
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
