import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const formData = await request.formData();

    const response = await backendFetch(
      `/api/v1/chats/${id}/upload`,
      {
        method: 'POST',
        cookie,
        body: formData,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
