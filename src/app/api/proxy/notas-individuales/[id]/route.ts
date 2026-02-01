import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const response = await backendFetch(`/api/v1/notas_individuales/${id}`, { method: 'DELETE', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error deleting nota individual:', error);
    return NextResponse.json({ error: 'Failed to delete nota individual' }, { status: 500 });
  }
}
