import { NextRequest, NextResponse } from "next/server";
import https from "https";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://127.0.0.1';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const ALLOWED_PREFIXES = ['uploads/videos/'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const videoPath = resolvedParams.path.join('/');

    // Security: block path traversal
    if (videoPath.includes('..') || videoPath.includes('//') || videoPath.startsWith('/')) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // Only allow video paths
    if (!ALLOWED_PREFIXES.some(prefix => videoPath.startsWith(prefix))) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    const videoUrl = `${BACKEND_URL}/${videoPath}`;

    // Forward JWT cookie as Authorization header
    const jwtCookie = request.cookies.get('jwt')?.value;
    const headers: Record<string, string> = {};
    if (jwtCookie) {
      headers['Authorization'] = `Bearer ${jwtCookie}`;
    }

    // Forward Range header for seeking support
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const response = await fetch(videoUrl, {
      headers,
      // @ts-expect-error - agent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    if (!response.ok && response.status !== 206) {
      return new NextResponse("Video not found", { status: response.status });
    }

    // Validate content type
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.some(t => contentType.includes(t))) {
      return new NextResponse("Invalid content type", { status: 400 });
    }

    // Stream the response body directly
    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    // Forward content-length and content-range for Range requests
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');

    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }

    // Return streaming response
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    return new NextResponse("Video not found", { status: 404 });
  }
}
