import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch('/api/v1/admin/system/stats', {
      method: 'GET',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system stats' },
      { status: 500 }
    );
  }
}
