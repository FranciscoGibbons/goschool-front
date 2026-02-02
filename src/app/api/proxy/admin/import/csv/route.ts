import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend-fetch';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const formData = await request.formData();
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const response = await backendFetch(
      `/api/v1/admin/import/csv${queryString ? `?${queryString}` : ''}`,
      {
        method: 'POST',
        cookie,
        body: formData,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
