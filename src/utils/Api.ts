const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Error tipado lanzado por ApiFetch cuando la respuesta no es 2xx.
 * - status: código HTTP devuelto por el backend.
 * - message: mensaje del backend (cuando lo expone) o un fallback descriptivo.
 * - body: cuerpo crudo de la respuesta (objeto si es JSON, string si no).
 *
 * Uso típico en componentes/hooks:
 *   try { ... } catch (e) {
 *     if (e instanceof ApiError && e.status === 401) logout();
 *     toast.error(e instanceof ApiError ? e.message : 'Error inesperado');
 *   }
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type JsonLike = Record<string, unknown> | unknown[] | null;

async function request<T = unknown>(
  method: Method,
  endpoint: string,
  body?: JsonLike | FormData,
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {};
  // Cuando es FormData, el navegador setea Content-Type con el boundary correcto.
  // Solo añadimos JSON cuando NO es FormData.
  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'include', // Vital: incluye la cookie httpOnly del backend.
  };

  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, init);

  // 204 No Content: el backend dice "ok pero no hay body".
  if (res.status === 204) {
    return undefined as T;
  }

  // Intentamos parsear el body como JSON; si no lo es, conservamos el texto.
  const rawText = await res.text();
  let parsed: unknown = rawText;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Lo dejamos como string (ej. el backend devolvió HTML de error).
    }
  }

  if (!res.ok) {
    // Intentamos rescatar el mensaje real del backend antes de caer al fallback.
    const message =
      (typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String((parsed as { message?: unknown }).message)
        : '') ||
      (typeof parsed === 'object' && parsed !== null && 'error' in parsed
        ? String((parsed as { error?: unknown }).error)
        : '') ||
      (typeof parsed === 'string' && parsed) ||
      `HTTP ${res.status} en ${method} ${endpoint}`;

    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

export const ApiFetch = {
  get: <T = unknown>(endpoint: string) => request<T>('GET', endpoint),
  post: <T = unknown>(endpoint: string, data?: JsonLike | FormData) =>
    request<T>('POST', endpoint, data),
  put: <T = unknown>(endpoint: string, data?: JsonLike | FormData) =>
    request<T>('PUT', endpoint, data),
  patch: <T = unknown>(endpoint: string, data?: JsonLike | FormData) =>
    request<T>('PATCH', endpoint, data),
  delete: <T = unknown>(endpoint: string) => request<T>('DELETE', endpoint),
};
