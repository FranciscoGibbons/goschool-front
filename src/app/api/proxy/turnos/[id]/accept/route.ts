import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();
    const response = await backendFetch(`/api/v1/turnos/${id}/accept/`, { method: 'PUT', cookie, body });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error accepting meeting request:', error);
    return NextResponse.json({ error: 'Failed to accept meeting request' }, { status: 500 });
  }
}
