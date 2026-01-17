import { NextRequest, NextResponse } from "next/server";
import https from "https";

// Use BACKEND_URL for server-side requests (Docker network), fallback to NEXT_PUBLIC for local dev
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://127.0.0.1';

// Create HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');
    const imageUrl = `${BACKEND_URL}/${imagePath}`;

    console.log("[IMAGE PROXY DEBUG] Request for:", imagePath);
    console.log("[IMAGE PROXY DEBUG] Fetching from:", imageUrl);
    console.log("[IMAGE PROXY DEBUG] BACKEND_URL:", BACKEND_URL);

    const response = await fetch(imageUrl, {
      // @ts-expect-error - agent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    console.log("[IMAGE PROXY DEBUG] Response status:", response.status);

    if (!response.ok) {
      console.error("[IMAGE PROXY DEBUG] Backend returned error:", response.status, response.statusText);
      return new NextResponse("Image not found", {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log("[IMAGE PROXY DEBUG] Success, content-type:", contentType, "size:", buffer.byteLength);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("[IMAGE PROXY DEBUG] Error proxying image:", error);

    // Return 404
    return new NextResponse("Image not found", {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}