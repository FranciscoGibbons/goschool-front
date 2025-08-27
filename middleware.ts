import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtener la cookie JWT
  const jwtCookie = request.cookies.get('jwt')
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/asignaturas', '/calificaciones', '/examenes', '/horario', '/mensajes', '/perfil']
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // Si es una ruta protegida y no hay token, redirigir a login
  if (isProtectedRoute && !jwtCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
