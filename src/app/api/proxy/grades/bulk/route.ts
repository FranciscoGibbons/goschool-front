import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await backendFetch('/api/v1/grades/bulk/', {
      method: 'POST',
      cookie,
      body,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error creating bulk grades:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk grades' },
      { status: 500 }
    );
  }
}
