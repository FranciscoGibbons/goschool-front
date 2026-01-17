import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

interface BackendFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  cookie?: string;
}

interface BackendFetchResult<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export async function backendFetch<T = unknown>(
  endpoint: string,
  options: BackendFetchOptions = {}
): Promise<BackendFetchResult<T>> {
  const { method = 'GET', headers = {}, body, cookie } = options;

  // Build headers with cookie always included
  const requestHeaders: Record<string, string> = {
    ...headers,
    ...(cookie ? { Cookie: cookie } : {}),
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
    withCredentials: true,
  };

  if (body !== undefined) {
    config.data = body;
  }

  const response: AxiosResponse<T> = await axios(config);

  // Extract headers we care about
  const responseHeaders: Record<string, string> = {};
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
