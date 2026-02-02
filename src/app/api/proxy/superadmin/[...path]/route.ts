import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = path.join('/');
    const cookie = request.headers.get('cookie') || '';
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const endpoint = `/api/superadmin/${pathStr}${pathStr.endsWith('/') ? '' : '/'}${queryString ? `?${queryString}` : ''}`;

    let body: unknown = undefined;
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        body = await request.json();
      } catch {
        // No body or not JSON
      }
    }

    const response = await backendFetch(endpoint, {
      method: request.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      cookie,
      body,
    });

    const nextResponse = NextResponse.json(response.data, { status: response.status });

    // Forward Set-Cookie headers from backend
    if (response.headers['Set-Cookie']) {
      nextResponse.headers.set('Set-Cookie', response.headers['Set-Cookie']);
    }

    return nextResponse;
  } catch (error) {
    console.error('Super admin proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
