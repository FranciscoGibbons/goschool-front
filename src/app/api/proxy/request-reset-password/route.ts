import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function getTenant(request: NextRequest): string {
  const host = request.headers.get('host') || '';
  const match = host.match(/^([a-z0-9-]+)\.goschool\./);
  return match ? match[1] : (process.env.NEXT_PUBLIC_DEFAULT_SCHOOL || '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const tenant = getTenant(request);

    const response = await axios.post(`${BACKEND_URL}/api/v1/request_reset_password/`, body, {
      httpsAgent,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'X-Forwarded-For': forwardedFor,
        ...(tenant ? { 'X-Tenant': tenant } : {}),
      },
    });

    return NextResponse.json(response.data || { success: true }, { status: response.status });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to request password reset' },
      { status: 500 }
    );
  }
}
