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

    const res = await axios.get(`${apiUrl}/api/v1/personal_data/`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al obtener datos personales";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener datos personales" },
      { status: 500 }
    );
  }
}
