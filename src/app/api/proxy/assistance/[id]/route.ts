import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/api/v1/assistance/${id}/`, {
      method: 'GET',
      headers: {
        'Cookie': cookie,
      },
      credentials: 'include',
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching assistance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assistance' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/assistance/${id}/`, {
      method: 'PUT',
      headers: {
        'Cookie': cookie,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      // @ts-expect-error - httpsAgent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating assistance:', error);
    return NextResponse.json(
      { error: 'Failed to update assistance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/api/v1/assistance/${id}/`, {
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

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting assistance:', error);
    return NextResponse.json(
      { error: 'Failed to delete assistance' },
      { status: 500 }
    );
  }
}
