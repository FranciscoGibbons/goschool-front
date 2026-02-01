import { NextRequest, NextResponse } from "next/server";
import https from "https";

// Use BACKEND_URL for server-side requests (Docker network), fallback to NEXT_PUBLIC for local dev
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://127.0.0.1';

// Create HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Directorios permitidos para servir archivos (whitelist)
const ALLOWED_PREFIXES = [
  'uploads/profile_pictures/',
  'uploads/files/',
  'uploads/submissions/',
  'uploads/chat_files/',
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');

    // Bloquear path traversal
    if (imagePath.includes('..') || imagePath.includes('//') || imagePath.startsWith('/')) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // Solo permitir paths dentro de directorios de uploads
    if (!ALLOWED_PREFIXES.some(prefix => imagePath.startsWith(prefix))) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    const imageUrl = `${BACKEND_URL}/${imagePath}`;

    const response = await fetch(imageUrl, {
      // @ts-expect-error - agent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    if (!response.ok) {
      return new NextResponse("Image not found", {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Solo permitir content-types de imagen
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const safeContentType = allowedTypes.includes(contentType) ? contentType : 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': safeContentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse("Image not found", {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}