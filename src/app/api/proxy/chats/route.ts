import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

// GET /api/proxy/chats - List user's chats
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch('/api/v1/chats/', {
      method: 'GET',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/proxy/chats - Create new chat
export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await backendFetch('/api/v1/chats/', {
      method: 'POST',
      cookie,
      body,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create chat' },
      { status: 500 }
    );
  }
}
