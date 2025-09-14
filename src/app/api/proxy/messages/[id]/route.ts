import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

interface Params {
  id: string;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
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

    const res = await axios.put(`${apiUrl}/api/v1/messages/${params.id}`, body, {
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
      const message = error.response?.data || "Error al actualizar mensaje";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al actualizar mensaje" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
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

    const res = await axios.delete(`${apiUrl}/api/v1/messages/${params.id}`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al eliminar mensaje";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al eliminar mensaje" },
      { status: 500 }
    );
  }
}
