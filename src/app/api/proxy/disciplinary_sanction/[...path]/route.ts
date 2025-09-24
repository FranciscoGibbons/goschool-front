// src/app/api/proxy/disciplinary_sanction/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Crear un agente HTTPS que ignore certificados auto-firmados
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://163.176.141.4';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const { searchParams } = new URL(request.url);
    
    // Construir la URL del backend
    let backendUrl = `${BACKEND_URL}/api/v1/disciplinary_sanction/`;
    if (path.length > 0 && path[0] !== '') {
      backendUrl += path.join('/');
    }

    // Agregar query parameters si existen
    if (searchParams.toString()) {
      backendUrl += `?${searchParams.toString()}`;
    }

    console.log('Disciplinary Sanctions Proxy GET request to:', backendUrl);

    // Obtener cookies del request
    const cookies = request.headers.get('cookie');
    console.log('Request cookies:', cookies ? 'Present' : 'None');

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      // @ts-expect-error - fetch options
      agent,
    });

    const data = await response.text();
    console.log('Disciplinary Sanctions Backend response status:', response.status);
    console.log('Disciplinary Sanctions Backend response:', data.substring(0, 500));

    if (response.status === 404) {
      // Si es 404, puede ser que la tabla esté vacía o no exista
      // Devolvemos una lista vacía en lugar de error
      console.log('Backend returned 404, returning empty array');
      return NextResponse.json([]);
    }

    if (!response.ok) {
      console.error('Backend error:', response.status, data);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error('Failed to parse backend response as JSON:', parseError);
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error('Disciplinary Sanctions Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    // Construir la URL del backend
    let backendUrl = `${BACKEND_URL}/api/v1/disciplinary_sanction/`;
    if (path.length > 0 && path[0] !== '') {
      backendUrl += path.join('/');
    }

    console.log('Proxy POST request to:', backendUrl);

    // Obtener el body del request
    const body = await request.text();
    console.log('POST body:', body);

    // Obtener cookies del request
    const cookies = request.headers.get('cookie');

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      body,
      // @ts-expect-error - fetch options
      agent,
    });

    const data = await response.text();
    console.log('Backend POST response status:', response.status);
    console.log('Backend POST response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    // Construir la URL del backend
    let backendUrl = `${BACKEND_URL}/api/v1/disciplinary_sanction/`;
    if (path.length > 0 && path[0] !== '') {
      backendUrl += path.join('/');
    }

    console.log('Proxy PUT request to:', backendUrl);

    // Obtener el body del request
    const body = await request.text();
    console.log('PUT body:', body);

    // Obtener cookies del request
    const cookies = request.headers.get('cookie');

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      body,
      // @ts-expect-error - fetch options
      agent,
    });

    const data = await response.text();
    console.log('Backend PUT response status:', response.status);
    console.log('Backend PUT response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error('Proxy PUT error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    // Construir la URL del backend
    let backendUrl = `${BACKEND_URL}/api/v1/disciplinary_sanction/`;
    if (path.length > 0 && path[0] !== '') {
      backendUrl += path.join('/');
    }

    console.log('Proxy DELETE request to:', backendUrl);

    // Obtener cookies del request
    const cookies = request.headers.get('cookie');

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      // @ts-expect-error - fetch options
      agent,
    });

    const data = await response.text();
    console.log('Backend DELETE response status:', response.status);
    console.log('Backend DELETE response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Intentar parsear como JSON si hay contenido
    if (data.trim()) {
      try {
        const jsonData = JSON.parse(data);
        return NextResponse.json(jsonData, { status: response.status });
      } catch {
        return new NextResponse(data, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'text/plain',
          },
        });
      }
    } else {
      // Respuesta vacía exitosa
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    console.error('Proxy DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 }
    );
  }
}