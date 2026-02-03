import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const response = await backendFetch(`/api/v1/observaciones/${id}`, { method: 'DELETE', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error deleting observacion:', error);
    return NextResponse.json({ error: 'Failed to delete observacion' }, { status: 500 });
  }
}
