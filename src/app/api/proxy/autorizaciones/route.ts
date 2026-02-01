import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/autorizaciones/${queryString ? `?${queryString}` : ''}`;

    const response = await backendFetch(endpoint, { method: 'GET', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching autorizaciones:', error);
    return NextResponse.json({ error: 'Failed to fetch autorizaciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();
    const response = await backendFetch('/api/v1/autorizaciones/', { method: 'POST', cookie, body });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error creating autorizacion:', error);
    return NextResponse.json({ error: 'Failed to create autorizacion' }, { status: 500 });
  }
}
