import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { safeJson } from '@/lib/api/safe-json';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/api/v1/personal_data/`, {
      method: 'GET',
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching personal data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal data' },
      { status: 500 }
    );
  }
}
