import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await backendFetch('/api/v1/roles/', {
      method: 'POST',
      body,
    });

    if (response.status >= 400) {
      return NextResponse.json(response.data, { status: response.status });
    }

    // Wrap the roles array in an object for frontend compatibility
    return NextResponse.json({ roles: response.data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}
