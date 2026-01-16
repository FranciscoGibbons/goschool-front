import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

// Use BACKEND_URL for server-side requests (Docker network), fallback to NEXT_PUBLIC for local dev
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://127.0.0.1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');
    const imageUrl = `${BACKEND_URL}/${imagePath}`;

    console.log("🖼️ Proxy de imagen:", imageUrl);

    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios.get(imageUrl, {
      httpsAgent: httpsAgent,
      responseType: 'arraybuffer'
    });

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    
    // Return a default image or 404
    return new NextResponse("Image not found", {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}