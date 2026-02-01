import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const response = await backendFetch(`/api/v1/circulares/${id}/confirm/`, { method: 'POST', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error confirming circular:', error);
    return NextResponse.json({ error: 'Failed to confirm circular' }, { status: 500 });
  }
}
