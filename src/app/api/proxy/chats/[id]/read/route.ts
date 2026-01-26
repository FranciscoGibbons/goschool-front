import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch(
      `/api/v1/chats/${id}/read`,
      {
        method: 'PUT',
        cookie,
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark chat as read' },
      { status: 500 }
    );
  }
}
