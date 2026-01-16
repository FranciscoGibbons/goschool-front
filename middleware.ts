import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación - centralizadas para fácil mantenimiento
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
  '/api/proxy/login',
  '/api/proxy/roles',
  '/api/proxy/verify_token',
  '/api/proxy/verify-token',
  '/_next',
  '/favicon.ico',
  '/images',
  '/public'
] as const;

// Función para verificar token usando el endpoint existente
async function verifyTokenWithBackend(request: NextRequest): Promise<boolean> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return false;

    // Hacer llamada interna al endpoint de verificación (corregido: usar underscore)
    const verifyUrl = new URL('/api/proxy/verify_token/', request.url);
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      // Agregar timeout más corto
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch (error) {
    console.error('Error en middleware verificando token:', error);
    return false;
  }
}

// Headers de seguridad
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevenir ataques XSS
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
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
  
  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
    // Obtener la cookie JWT
    const jwtCookie = request.cookies.get('jwt');
    
    // Si no hay token, redirigir a login
    if (!jwtCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      return addSecurityHeaders(response);
    }
    
    // Verificar el token con el backend usando el endpoint correcto
    const isValidToken = await verifyTokenWithBackend(request);
    if (!isValidToken) {
      // Token inválido, limpiar cookie y redirigir
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      loginUrl.searchParams.set('expired', 'true');
      const response = NextResponse.redirect(loginUrl);
      
      // Limpiar la cookie JWT inválida
      response.cookies.set('jwt', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return addSecurityHeaders(response);
    }
    
    // Token válido, continuar
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Para rutas no protegidas, solo añadir headers de seguridad
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - excepto /api/proxy que necesita verificación especial
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
