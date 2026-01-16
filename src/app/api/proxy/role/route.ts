import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch<string>('/api/v1/role/', {
      method: 'GET',
      cookie,
    });

    if (response.status >= 400) {
      return NextResponse.json({ error: response.data }, { status: response.status });
    }

    // Return the role as plain text (backend returns just the role string)
    const role = typeof response.data === 'string'
      ? response.data.replace(/"/g, '')
      : response.data;
    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}
