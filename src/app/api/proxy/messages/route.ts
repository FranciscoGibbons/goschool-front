import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/messages/`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al obtener mensajes";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener mensajes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.post(`${apiUrl}/api/v1/messages/`, body, {
      headers: { 
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al crear mensaje";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al crear mensaje" },
      { status: 500 }
    );
  }
}
