import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { safeJson } from '@/lib/api/safe-json';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie') || '';
    const formData = await request.formData();

    const response = await fetch(
      `${BACKEND_URL}/api/v1/chats/${id}/upload`,
      {
        method: 'POST',
        headers: {
          Cookie: cookieHeader,
        },
        credentials: 'include',
        body: formData,
        // @ts-expect-error - httpsAgent is valid for node-fetch
        agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
      }
    );

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
