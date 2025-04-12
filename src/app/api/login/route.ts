import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await axios.post('http://127.0.0.1:8080/api/v1/login/', body, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    // 🔁 Transmitimos el set-cookie del backend al navegador
    const setCookie = res.headers['set-cookie'];

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Set-Cookie': setCookie?.join('; ') || '',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 });
  }
}
