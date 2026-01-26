import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/public_personal_data/${queryString ? `?${queryString}` : ''}`;

    const response = await backendFetch(endpoint, {
      method: 'GET',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching public personal data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public personal data' },
      { status: 500 }
    );
  }
}
