import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch('/api/v1/verify_token/', {
      method: 'GET',
      cookie,
    });

    if (response.status >= 400) {
      return NextResponse.json({ error: response.data }, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
