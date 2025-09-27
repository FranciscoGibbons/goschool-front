import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');
    const imageUrl = `https://163.176.141.4/${imagePath}`;
    
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