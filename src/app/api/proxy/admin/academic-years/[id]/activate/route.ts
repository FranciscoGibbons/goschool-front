import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch(`/api/v1/admin/academic-years/${id}/activate`, {
      method: 'POST',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error activating academic year:', error);
    return NextResponse.json(
      { error: 'Failed to activate academic year' },
      { status: 500 }
    );
  }
}
