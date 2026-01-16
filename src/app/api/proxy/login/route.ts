import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await backendFetch('/api/v1/login/', {
      method: 'POST',
      body,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (response.headers['Set-Cookie']) {
      headers['Set-Cookie'] = response.headers['Set-Cookie'];
    }

    return NextResponse.json(response.data, {
      status: response.status,
      headers
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to login' },
      { status: 500 }
    );
  }
}
