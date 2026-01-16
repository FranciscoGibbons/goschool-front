import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';

    const response = await backendFetch('/api/v1/profile_pictures/', {
      method: 'GET',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error fetching profile pictures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile pictures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const formData = await request.formData();

    const response = await backendFetch('/api/v1/profile_pictures/', {
      method: 'POST',
      cookie,
      body: formData,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const formData = await request.formData();

    const response = await backendFetch('/api/v1/profile_pictures/', {
      method: 'PUT',
      cookie,
      body: formData,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
}
