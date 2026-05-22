import { useSessionStore } from '../store';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/** Typed fetch wrapper that injects auth headers and handles 401 token refresh. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { tokens, tenantId, setTokens, clearSession } = useSessionStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Attempt transparent token refresh on 401
  if (res.status === 401 && tokens?.refreshToken) {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (refreshRes.ok) {
      const newTokens = (await refreshRes.json()) as { accessToken: string; refreshToken: string; expiresIn: number };
      setTokens(newTokens);
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });

      if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.text());
      return retryRes.json() as Promise<T>;
    } else {
      clearSession();
      throw new ApiError(401, 'Session expired — please log in again');
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
