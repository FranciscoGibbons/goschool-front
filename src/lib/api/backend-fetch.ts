import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

interface BackendFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown | FormData;
  cookie?: string;
  tenant?: string;
}

interface BackendFetchResult<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Extrae el token JWT de un string de cookies
 */
function extractJwtFromCookie(cookieString: string): string | null {
  const cookies = cookieString.split(';').map(c => c.trim());
  const jwtCookie = cookies.find(c => c.startsWith('jwt='));
  if (jwtCookie) {
    return jwtCookie.substring(4); // Remover "jwt="
  }
  return null;
}

export async function backendFetch<T = unknown>(
  endpoint: string,
  options: BackendFetchOptions = {}
): Promise<BackendFetchResult<T>> {
  const { method = 'GET', headers = {}, body, cookie } = options;
  const tenant = options.tenant ?? process.env.NEXT_PUBLIC_DEFAULT_SCHOOL ?? '';

  // Extraer JWT de la cookie y enviarlo como Bearer token
  const token = cookie ? extractJwtFromCookie(cookie) : null;

  const requestHeaders: Record<string, string> = {
    ...headers,
    // Enviar como Authorization: Bearer en lugar de Cookie
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Pasar tenant si está disponible
    ...(tenant ? { 'X-Tenant': tenant } : {}),
  };

  // Add Content-Type for JSON body (not FormData)
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const config: AxiosRequestConfig = {
    method,
    url: `${BACKEND_URL}${endpoint}`,
    headers: requestHeaders,
    httpsAgent,
    validateStatus: () => true, // Don't throw on any status code
  };

  if (body !== undefined) {
    config.data = body;
  }

  const response: AxiosResponse<T> = await axios(config);

  // Extraer headers de respuesta que nos interesan
  const responseHeaders: Record<string, string> = {};

  // Ya no necesitamos propagar Set-Cookie, pero mantenemos por compatibilidad
  if (response.headers['set-cookie']) {
    const setCookie = response.headers['set-cookie'];
    responseHeaders['Set-Cookie'] = Array.isArray(setCookie) ? setCookie.join(', ') : setCookie;
  }

  return {
    data: response.data,
    status: response.status,
    headers: responseHeaders,
  };
}

export { BACKEND_URL };
