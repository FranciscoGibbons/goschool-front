import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * Extracts the JWT token value from the backend Set-Cookie header
 */
function extractTokenFromSetCookie(setCookieHeader: string | string[]): string | null {
  const cookieString = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  const match = cookieString.match(/jwt=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    const response = await axios.post(`${BACKEND_URL}/api/superadmin/login/`, body, {
      httpsAgent,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'X-Forwarded-For': forwardedFor,
      },
    });

    // If login failed, return the error
    if (response.status !== 200) {
      return NextResponse.json(response.data, { status: response.status });
    }

    // Extract the token from Set-Cookie returned by the backend
    const setCookieHeader = response.headers['set-cookie'];
    if (!setCookieHeader) {
      console.error('Super admin login: Backend did not return Set-Cookie header');
      return NextResponse.json(
        { error: 'Login failed - no token received' },
        { status: 500 }
      );
    }

    const token = extractTokenFromSetCookie(setCookieHeader);
    if (!token) {
      console.error('Super admin login: Could not extract JWT from Set-Cookie header');
      return NextResponse.json(
        { error: 'Login failed - invalid token format' },
        { status: 500 }
      );
    }

    // Create response
    const res = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Store the token as an HTTP-only cookie
    res.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour (same as backend)
    });

    return res;
  } catch (error) {
    console.error('Error during super admin login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
