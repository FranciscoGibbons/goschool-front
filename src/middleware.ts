import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación (solo con subdominio)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/asignaturas',
  '/calificaciones',
  '/examenes',
  '/horario',
  '/mensajes',
  '/perfil',
  '/conducta',
  '/asistencia',
  '/entregas'
] as const;

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/login',
  '/superadmin-login',
  '/api/proxy/login',
  '/api/proxy/roles',
  '/api/proxy/verify_token',
  '/api/proxy/verify-token',
  '/api/proxy/superadmin',
  '/api/proxy/school-info',
  '/_next',
  '/favicon.ico',
  '/images',
  '/public'
] as const;

// Rutas permitidas sin subdominio (landing + superadmin)
const NO_SUBDOMAIN_ALLOWED = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/superadmin-login',
  '/superadmin',
  '/_next',
  '/favicon.ico',
  '/images',
  '/public',
  '/api/proxy/superadmin',
  '/api/proxy/login',
  '/api/proxy/verify-token',
  '/api/proxy/verify_token',
  '/api/proxy/request-reset-password',
  '/api/proxy/reset-password',
  '/api/proxy/school-info',
] as const;

// In-memory cache for subdomain validation (TTL: 5 minutes)
const subdomainCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getSubdomain(host: string): string | null {
  const match = host.match(/^([a-z0-9-]+)\.goschool\./);
  if (match) return match[1];
  return null;
}

function getTenant(host: string): string | null {
  return getSubdomain(host) || process.env.NEXT_PUBLIC_DEFAULT_SCHOOL || null;
}

async function isValidSubdomain(subdomain: string, request: NextRequest): Promise<boolean> {
  const now = Date.now();
  const cached = subdomainCache.get(subdomain);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.valid;
  }

  try {
    // Use the internal proxy route to avoid TLS issues in Edge Runtime
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/proxy/school-info/${subdomain}`, {
      headers: { 'x-middleware-validate': '1' },
    });
    const valid = res.ok;
    subdomainCache.set(subdomain, { valid, timestamp: now });
    return valid;
  } catch {
    // On error, don't cache and allow through (fail open for availability)
    return true;
  }
}

// Headers de seguridad
function addSecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost';
  const backendHost = backendUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  response.headers.set('x-nonce', nonce);

  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    `script-src 'self' 'nonce-${nonce}'; ` +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    `connect-src 'self' ${backendUrl} wss://${backendHost}; ` +
    "frame-ancestors 'none';"
  );

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

/**
 * Create a NextResponse.next() with the nonce set on both request headers
 * (so Next.js injects it into inline scripts) and response headers (for CSP).
 */
function secureNext(request: NextRequest): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return addSecurityHeaders(response, nonce);
}

function secureRedirect(url: URL): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  return addSecurityHeaders(NextResponse.redirect(url), nonce);
}

function matchesAny(pathname: string, routes: readonly string[]): boolean {
  return routes.some(route => pathname.startsWith(route));
}

function handleProtectedRoute(request: NextRequest, pathname: string): NextResponse | null {
  if (!PROTECTED_ROUTES.some(route => pathname.startsWith(route))) return null;

  const jwtCookie = request.cookies.get('jwt');
  if (!jwtCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return secureRedirect(loginUrl);
  }

  return secureNext(request);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const tenant = getTenant(host);

  // --- Con subdominio real: validar que existe ---
  if (subdomain) {
    if (matchesAny(pathname, PUBLIC_ROUTES)) return secureNext(request);

    const valid = await isValidSubdomain(subdomain, request);
    if (!valid) {
      const nonce = btoa(crypto.randomUUID());
      const notFoundUrl = new URL('/not-found-page', request.url);
      return addSecurityHeaders(NextResponse.rewrite(notFoundUrl), nonce);
    }

    if (pathname === '/') return secureNext(request);
    if (matchesAny(pathname, NO_SUBDOMAIN_ALLOWED)) return secureNext(request);
    return handleProtectedRoute(request, pathname) ?? secureNext(request);
  }

  // --- Sin subdominio real Y sin default school: solo landing + superadmin ---
  if (!tenant) {
    if (pathname === '/') return secureNext(request);
    if (matchesAny(pathname, NO_SUBDOMAIN_ALLOWED)) return secureNext(request);
    return secureRedirect(new URL('/', request.url));
  }

  // --- Con default school (no subdomain but tenant env set): comportamiento normal ---
  if (matchesAny(pathname, PUBLIC_ROUTES)) return secureNext(request);
  if (pathname === '/') return secureNext(request);
  if (matchesAny(pathname, NO_SUBDOMAIN_ALLOWED)) return secureNext(request);
  return handleProtectedRoute(request, pathname) ?? secureNext(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
