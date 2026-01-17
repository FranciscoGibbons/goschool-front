import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/messages/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/messages/`, {
      method: 'POST',
      headers: {
        'Cookie': cookie,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    // Handle empty responses (like 201 Created)
    const text = await response.text();
    const data = text && text.trim() ? JSON.parse(text) : { success: true };
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
