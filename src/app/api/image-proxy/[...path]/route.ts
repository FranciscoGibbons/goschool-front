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
  'uploads/videos/',
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

    // Extract the JWT cookie from the incoming request and forward it as an
    // Authorization header so the backend can authenticate the file request.
    const jwtCookie = request.cookies.get('jwt')?.value;
    const headers: Record<string, string> = {};
    if (jwtCookie) {
      headers['Authorization'] = `Bearer ${jwtCookie}`;
    }

    const response = await fetch(imageUrl, {
      headers,
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

    // Permitir content-types de imagen, documentos y videos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4', 'video/webm', 'video/quicktime',
    ];
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