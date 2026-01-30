import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await backendFetch('/api/v1/admin/subjects', {
      method: 'POST',
      cookie,
      body,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}
