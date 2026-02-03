import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { safeJson } from '@/lib/api/safe-json';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function extractJwtFromCookie(cookieString: string): string | null {
  const cookies = cookieString.split(';').map(c => c.trim());
  const jwtCookie = cookies.find(c => c.startsWith('jwt='));
  if (jwtCookie) {
    return jwtCookie.substring(4);
  }
  return null;
}

function getTenant(request: NextRequest): string {
  const host = request.headers.get('host') || '';
  const match = host.match(/^([a-z0-9-]+)\.goschool\./);
  return match ? match[1] : (process.env.NEXT_PUBLIC_DEFAULT_SCHOOL || '');
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const token = extractJwtFromCookie(cookie);
    const formData = await request.formData();
    const tenant = getTenant(request);

    const response = await fetch(`${BACKEND_URL}/api/v1/assessments/upload/`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenant ? { 'X-Tenant': tenant } : {}),
      },
      body: formData,
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error uploading assessment with file:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment with file' },
      { status: 500 }
    );
  }
}
