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

    // Llamada directa al backend (sin usar backendFetch porque el login no necesita auth)
    const response = await axios.post(`${BACKEND_URL}/api/login/`, body, {
      httpsAgent,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'X-Forwarded-For': forwardedFor,
      },
    });

    // Si el login falló, devolver el error
    if (response.status !== 200) {
      return NextResponse.json(response.data, { status: response.status });
    }

    // Extraer el token del Set-Cookie que devuelve el backend
    const setCookieHeader = response.headers['set-cookie'];
    if (!setCookieHeader) {
      console.error('Backend did not return Set-Cookie header');
      return NextResponse.json(
        { success: false, message: 'Login failed - no token received' },
        { status: 500 }
      );
    }

    const token = extractTokenFromSetCookie(setCookieHeader);
    if (!token) {
      console.error('Could not extract JWT from Set-Cookie header');
      return NextResponse.json(
        { success: false, message: 'Login failed - invalid token format' },
        { status: 500 }
      );
    }

    // Crear respuesta exitosa y setear cookie HTTP-only en el frontend
    const res = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Guardar el token como cookie HTTP-only
    res.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hora (igual que el backend)
    });

    return res;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to login' },
      { status: 500 }
    );
  }
}
