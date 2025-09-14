import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("🔍 Solicitando roles para:", body);

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.post(`${apiUrl}/api/v1/roles/`, body, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    console.log("✅ Respuesta de los roles:", res.data);

    return NextResponse.json({ roles: res.data }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    
    if (axios.isAxiosError(error)) {
      console.error("📊 Status:", error.response?.status);
      console.error("📄 Data:", error.response?.data);
      console.error("🔗 URL:", error.config?.url);
    }
    
    return NextResponse.json(
      { error: "Error al obtener roles", details: String(error) },
      { status: 500 }
    );
  }
}
