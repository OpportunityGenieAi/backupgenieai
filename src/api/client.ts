import Constants from 'expo-constants';
import { API_BASE_URL } from '../config/env';
import { TokenStorage } from './tokenStorage';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Optional second address for the same server. Set "apiFallbackUrl" under "extra" in app.json.
const FALLBACK_URL: string | undefined = (Constants.expoConfig?.extra as any)?.apiFallbackUrl;
const REQUEST_TIMEOUT_MS = 25000;
const NETWORK_ERROR = "Can't reach the server. Check your internet connection and try again.";

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function buildHeaders(auth: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await TokenStorage.read();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function describeError(body: any, status: number): string {
  const detail = body?.detail;
  if (typeof detail === 'string' && detail) return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d: any) => (d?.msg ? String(d.msg) : 'invalid value')).join('; ');
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The server is busy or restarting. Please try again in a moment.';
  }
  return `Something went wrong (${status}).`;
}

async function handle(res: Response): Promise<any> {
  const text = await res.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null; // e.g. an HTML error page from a proxy
    }
  }
  if (res.ok) return body;
  throw new ApiError(res.status, describeError(body, res.status));
}

function toQuery(params?: Record<string, string | undefined>): string {
  if (!params) return '';
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (filtered.length === 0) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`).join('&');
}

const BASES: string[] = Array.from(
  new Set([API_BASE_URL, FALLBACK_URL].filter((b): b is string => !!b).map((b) => b.replace(/\/+$/, ''))),
);
let preferred = 0; // remembers which address worked last

async function send(method: Method, pathAndQuery: string, auth: boolean, body?: any): Promise<Response> {
  const headers = await buildHeaders(auth);
  const order = BASES.map((_, i) => i).sort((a, b) => (a === preferred ? -1 : b === preferred ? 1 : a - b));

  for (const i of order) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${BASES[i]}${pathAndQuery}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);
      preferred = i;
      return res;
    } catch (err: any) {
      clearTimeout(timer);
      // A timeout means the server may have received the request, so don't send a write twice.
      if (err?.name === 'AbortError' && method !== 'GET') break;
    }
  }
  throw new ApiError(0, NETWORK_ERROR);
}

export const api = {
  async get(path: string, opts: { auth?: boolean; query?: Record<string, string | undefined> } = {}) {
    return handle(await send('GET', path + toQuery(opts.query), !!opts.auth));
  },
  async post(path: string, body?: any, opts: { auth?: boolean } = {}) {
    return handle(await send('POST', path, !!opts.auth, body));
  },
  async put(path: string, body?: any, opts: { auth?: boolean } = {}) {
    return handle(await send('PUT', path, !!opts.auth, body));
  },
  async patch(path: string, body?: any, opts: { auth?: boolean } = {}) {
    return handle(await send('PATCH', path, !!opts.auth, body));
  },
  async delete(path: string, opts: { auth?: boolean } = {}) {
    const res = await send('DELETE', path, !!opts.auth);
    if (res.status === 204) return null;
    return handle(res);
  },
};