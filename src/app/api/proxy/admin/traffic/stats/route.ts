import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day') || new Date().toISOString().split('T')[0];

    const response = await backendFetch(`/api/v1/admin/traffic/stats?day=${day}`, {
      method: 'GET',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching traffic stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic stats' },
      { status: 500 }
    );
  }
}
