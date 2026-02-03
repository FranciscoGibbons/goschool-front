import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await backendFetch('/api/v1/push/unsubscribe/', {
      method: 'DELETE',
      cookie,
      body,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
