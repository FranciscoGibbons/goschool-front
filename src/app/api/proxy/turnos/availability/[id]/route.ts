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
    const response = await backendFetch(`/api/v1/turnos/availability/${id}`, { method: 'PUT', cookie, body });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const response = await backendFetch(`/api/v1/turnos/availability/${id}`, { method: 'DELETE', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 });
  }
}
