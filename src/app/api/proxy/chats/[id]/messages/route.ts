import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const searchParams = request.nextUrl.searchParams;
    const offset = searchParams.get('offset') || '0';
    const limit = searchParams.get('limit') || '50';

    const response = await fetch(
      `${BACKEND_URL}/api/v1/chats/${params.id}/messages?offset=${offset}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
        // @ts-expect-error - httpsAgent is valid for node-fetch
        agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/v1/chats/${params.id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        credentials: 'include',
        body: JSON.stringify(body),
        // @ts-expect-error - httpsAgent is valid for node-fetch
        agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
