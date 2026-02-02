import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await params;
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await backendFetch(
      `/api/v1/chats/${id}/messages/${messageId}`,
      {
        method: 'PUT',
        cookie,
        body,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to edit message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await params;
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch(
      `/api/v1/chats/${id}/messages/${messageId}`,
      {
        method: 'DELETE',
        cookie,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
