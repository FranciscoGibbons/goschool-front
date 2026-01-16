import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(
      `${BACKEND_URL}/api/v1/chats/${params.id}/read`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
        // @ts-expect-error - httpsAgent is valid for node-fetch
        agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark chat as read' },
      { status: 500 }
    );
  }
}
