import { env } from '../../core/config';

const FETCH_TIMEOUT_MS = 10_000;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      throw new Error(`API ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API timeout after ${FETCH_TIMEOUT_MS}ms on ${path}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
