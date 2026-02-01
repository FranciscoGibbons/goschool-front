import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function extractJwtFromCookie(cookieString: string): string | null {
  const cookies = cookieString.split(';').map(c => c.trim());
  const jwtCookie = cookies.find(c => c.startsWith('jwt='));
  return jwtCookie ? jwtCookie.substring(4) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie') || '';
    const token = extractJwtFromCookie(cookie);

    const response = await axios({
      method: 'GET',
      url: `${BACKEND_URL}/api/v1/autorizaciones/${id}/export/`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      httpsAgent,
      responseType: 'text',
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return NextResponse.json({ error: 'Failed to export' }, { status: response.status });
    }

    const contentDisposition = response.headers['content-disposition'] || 'attachment; filename="export.csv"';

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('Error exporting autorizacion:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
