/**
 * Minimal fetch-based HTTP client with baseURL, prefix, timeout, and token injection.
 */
import { getToken } from '@/utils/storage';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestOptions = {
  method?: RequestMethod;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
};

export type ApiError = {
  status: number;
  message: string;
  error?: string | number;
  data?: any;
};

export const isApiError = (err: unknown): err is ApiError => {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as any;
  return typeof anyErr.status === 'number' && typeof anyErr.message === 'string';
};

export type RequestConfig = {
  baseURL?: string;
  prefix?: string;
  timeout?: number;
};

const DEFAULT_CONFIG: Required<RequestConfig> = {
  baseURL: process.env.API_BASE || '',
  prefix: '/api/v1',
  timeout: 12000,
};

let onUnauthorized: (() => void) | undefined;

const buildURL = (path: string, params?: Record<string, any>) => {
  const isAbsolute = /^https?:\/\//i.test(path);
  const prefix = path.startsWith(DEFAULT_CONFIG.prefix) || isAbsolute ? '' : DEFAULT_CONFIG.prefix;
  const base = isAbsolute ? '' : DEFAULT_CONFIG.baseURL || '';
  const originFallback =
    typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
  const url = new URL(`${base}${prefix}${path}`, originFallback);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
};

const parseJSON = async (response: Response) => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params, body, headers = {}, timeout } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || DEFAULT_CONFIG.timeout);
  const url = buildURL(path, params);
  const token = getToken();

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = typeof body === 'string' ? body : JSON.stringify(body);
  }
  if (token) {
    finalHeaders['X-BLACKCAT-TOKEN'] = token;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      signal: options.signal || controller.signal,
    });
    const data = await parseJSON(response);
    if (!response.ok) {
      const apiError: ApiError = {
        status: response.status,
        message: (data as any)?.message || response.statusText,
        error: (data as any)?.error,
        data,
      };
      if ((response.status === 401 || response.status === 403) && onUnauthorized) {
        onUnauthorized();
      }
      throw apiError;
    }
    return data as T;
  } catch (err: any) {
    const isAbortError = err?.name === 'AbortError';
    const isTimeout = isAbortError && controller.signal.aborted;
    if (isTimeout) {
      const timeoutError: ApiError = { status: 0, message: 'Request Timout Out', error: 'timeout' };
      throw timeoutError;
    }
    if (isAbortError) {
      throw err;
    }
    if (isApiError(err)) throw err;
    const networkError: ApiError = {
      status: 0,
      message: err?.message || 'Request Error',
      error: 'network',
      data: err,
    };
    throw networkError;
  } finally {
    clearTimeout(timer);
  }
}

// 简单的延迟 mock，便于在开发或测试场景复用
export function mockResponse<T>(data: T, delay = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delay));
}
