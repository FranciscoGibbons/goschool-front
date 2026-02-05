import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function extractJwtFromCookie(cookieString: string): string | null {
  const cookies = cookieString.split(';').map(c => c.trim());
  const jwtCookie = cookies.find(c => c.startsWith('jwt='));
  return jwtCookie ? jwtCookie.substring(4) : null;
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('school_id');
    const field = searchParams.get('field');

    if (!schoolId || !field) {
      return NextResponse.json({ error: 'Missing school_id or field' }, { status: 400 });
    }

    const cookie = request.headers.get('cookie') || '';
    const token = extractJwtFromCookie(cookie);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    const body = Buffer.from(await request.arrayBuffer());

    const url = `${BACKEND_URL}/api/superadmin/schools/upload-image/?school_id=${schoolId}&field=${field}`;

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': contentType,
        'Authorization': `Bearer ${token}`,
      },
      httpsAgent,
      validateStatus: () => true,
      maxBodyLength: 10 * 1024 * 1024,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
