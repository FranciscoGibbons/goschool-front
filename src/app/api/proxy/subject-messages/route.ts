import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { safeJson } from '@/lib/api/safe-json';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/subject_messages/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await safeJson(response);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching subject messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const contentType = request.headers.get('content-type') || '';

    // Handle multipart form data (file uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const response = await fetch(`${BACKEND_URL}/api/v1/subject_messages/`, {
        method: 'POST',
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
    }

    // Handle JSON - convert to FormData since backend expects multipart
    const body = await request.json();

    // Create FormData from JSON body
    const formData = new FormData();
    if (body.subject_id) formData.append('subject_id', String(body.subject_id));
    if (body.title) formData.append('title', body.title);
    if (body.content) formData.append('content', body.content);
    if (body.type) formData.append('type', body.type);

    const response = await fetch(`${BACKEND_URL}/api/v1/subject_messages/`, {
      method: 'POST',
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
    console.error('Error creating subject message:', error);
    return NextResponse.json(
      { error: 'Failed to create subject message' },
      { status: 500 }
    );
  }
}
