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
  '/_next',
  '/favicon.ico',
  '/images',
  '/public'
] as const;

// Rutas permitidas sin subdominio (landing + superadmin)
const NO_SUBDOMAIN_ALLOWED = [
  '/superadmin-login',
  '/superadmin',
  '/_next',
  '/favicon.ico',
  '/images',
  '/public',
  '/api/proxy/superadmin',
] as const;

function getSubdomain(host: string): string | null {
  const match = host.match(/^([a-z0-9-]+)\.goschool\./);
  return match ? match[1] : null;
}

// Headers de seguridad
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost';
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    `connect-src 'self' ${backendUrl}; ` +
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);

  // --- Sin subdominio: solo landing + superadmin ---
  if (!subdomain) {
    // Permitir la raíz (landing page)
    if (pathname === '/') {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Permitir rutas de superadmin y estáticos
    if (NO_SUBDOMAIN_ALLOWED.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Todo lo demás sin subdominio → redirect a landing
    const landingUrl = new URL('/', request.url);
    const response = NextResponse.redirect(landingUrl);
    return addSecurityHeaders(response);
  }

  // --- Con subdominio: comportamiento normal de la app escolar ---

  // Permitir rutas públicas sin verificación
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const jwtCookie = request.cookies.get('jwt');

    if (!jwtCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      return addSecurityHeaders(response);
    }

    // Cookie exists — actual token validation is handled by AuthProvider client-side
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Para rutas no protegidas con subdominio, solo añadir headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
