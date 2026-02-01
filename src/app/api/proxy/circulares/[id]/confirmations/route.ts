import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const response = await backendFetch(`/api/v1/circulares/${id}/confirmations/`, { method: 'GET', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching confirmations:', error);
    return NextResponse.json({ error: 'Failed to fetch confirmations' }, { status: 500 });
  }
}
