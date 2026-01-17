import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { safeJson } from '@/lib/api/safe-json';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/v1/profile_pictures/${user_id}`, {
      method: 'PUT',
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
      body: formData,
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
    const cookie = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/api/v1/profile_pictures/${user_id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}
