import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const response = await backendFetch(`/api/v1/circulares/${id}/reminder/`, { method: 'POST', cookie });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
