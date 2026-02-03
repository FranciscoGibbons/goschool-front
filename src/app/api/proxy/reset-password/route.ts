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
    const tenant = getTenant(request);

    const response = await axios.post(`${BACKEND_URL}/api/v1/reset_password/`, body, {
      httpsAgent,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        ...(tenant ? { 'X-Tenant': tenant } : {}),
      },
    });

    return NextResponse.json(response.data || { success: true }, { status: response.status });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
