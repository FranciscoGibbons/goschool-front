import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * Extrae el valor del token JWT del header Set-Cookie del backend
 */
function extractTokenFromSetCookie(setCookieHeader: string | string[]): string | null {
  const cookieString = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;

  // El formato es: jwt=TOKEN; Path=/; HttpOnly; Secure
  const match = cookieString.match(/jwt=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    // Get the temp JWT cookie from the request
    const jwtCookie = request.cookies.get('jwt');
    if (!jwtCookie) {
      return NextResponse.json(
        { success: false, message: 'No JWT cookie found' },
        { status: 401 }
      );
    }

    // Extract tenant from subdomain (e.g., stella.goschool.ar -> stella)
    const host = request.headers.get('host') || '';
    const tenantMatch = host.match(/^([a-z0-9-]+)\.goschool\./);
    const tenant = tenantMatch ? tenantMatch[1] : (request.headers.get('x-tenant') || '');

    // Send role selection to backend with the temp JWT
    // The body should just contain the role (e.g., "admin", "teacher", etc.)
    // Note: roles is at /api/roles/ (not /api/v1/roles/)
    const response = await axios.post(`${BACKEND_URL}/api/roles/`, body, {
      httpsAgent,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `jwt=${jwtCookie.value}`,
        'User-Agent': userAgent,
        'X-Forwarded-For': forwardedFor,
        ...(tenant ? { 'X-Tenant': tenant } : {}),
      },
    });

    // Si falló, devolver el error
    if (response.status !== 200) {
      return NextResponse.json(response.data, { status: response.status });
    }

    // Extraer el nuevo token (permanente) del Set-Cookie
    const setCookieHeader = response.headers['set-cookie'];
    if (!setCookieHeader) {
      console.error('Backend did not return Set-Cookie header');
      return NextResponse.json(
        { success: false, message: 'Role selection failed - no token received' },
        { status: 500 }
      );
    }

    const token = extractTokenFromSetCookie(setCookieHeader);
    if (!token) {
      console.error('Could not extract JWT from Set-Cookie header');
      return NextResponse.json(
        { success: false, message: 'Role selection failed - invalid token format' },
        { status: 500 }
      );
    }

    // Crear respuesta exitosa
    const res = NextResponse.json(
      { success: true, message: 'Role selected successfully' },
      { status: 200 }
    );

    // Guardar el nuevo token permanente como cookie HTTP-only
    res.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hora
    });

    return res;
  } catch (error) {
    console.error('Error selecting role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to select role' },
      { status: 500 }
    );
  }
}
