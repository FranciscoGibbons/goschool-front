import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();
    const response = await backendFetch('/api/v1/autorizaciones/respond/', { method: 'POST', cookie, body });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error responding to autorizacion:', error);
    return NextResponse.json({ error: 'Failed to respond to autorizacion' }, { status: 500 });
  }
}
