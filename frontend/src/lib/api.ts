export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}
