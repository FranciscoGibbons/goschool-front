import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

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

    const jwtCookie = request.cookies.get('jwt');
    if (!jwtCookie) {
      return NextResponse.json(
        { success: false, message: 'No JWT cookie found' },
        { status: 401 }
      );
    }

    const host = request.headers.get('host') || '';
    const tenantMatch = host.match(/^([a-z0-9-]+)\.goschool\./);
    const tenant = tenantMatch ? tenantMatch[1] : (process.env.NEXT_PUBLIC_DEFAULT_SCHOOL || request.headers.get('x-tenant') || '');

    const response = await axios.post(`${BACKEND_URL}/api/v1/switch_role/`, body, {
      httpsAgent,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtCookie.value}`,
        'User-Agent': userAgent,
        'X-Forwarded-For': forwardedFor,
        ...(tenant ? { 'X-Tenant': tenant } : {}),
      },
    });

    if (response.status !== 200) {
      return NextResponse.json(response.data, { status: response.status });
    }

    // Extract the new JWT from Set-Cookie if present
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const token = extractTokenFromSetCookie(setCookieHeader);
      if (token) {
        const res = NextResponse.json(
          { success: true, message: 'Role switched successfully' },
          { status: 200 }
        );

        res.cookies.set('jwt', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60,
        });

        return res;
      }
    }

    // No Set-Cookie means it was a no-op (same role)
    return NextResponse.json(
      { success: true, message: 'Role unchanged' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error switching role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to switch role' },
      { status: 500 }
    );
  }
}
