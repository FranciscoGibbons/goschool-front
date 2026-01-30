import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await backendFetch(`/api/v1/admin/academic-years/${id}`, {
      method: 'PUT',
      cookie,
      body,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error updating academic year:', error);
    return NextResponse.json(
      { error: 'Failed to update academic year' },
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

    const response = await backendFetch(`/api/v1/admin/academic-years/${id}`, {
      method: 'DELETE',
      cookie,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    return NextResponse.json(
      { error: 'Failed to delete academic year' },
      { status: 500 }
    );
  }
}
