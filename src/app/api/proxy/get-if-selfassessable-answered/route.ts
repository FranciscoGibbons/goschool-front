import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { safeJson } from '@/lib/api/safe-json';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/get_if_selfassessable_answered/`, {
      method: 'POST',
      headers: {
        'Cookie': cookie,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error checking if selfassessable answered:', error);
    return NextResponse.json(
      { error: 'Failed to check if selfassessable answered' },
      { status: 500 }
    );
  }
}
