import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("user_id");

    const paramId = id || userId;
    if (!paramId) {
      return NextResponse.json({ error: "id o user_id es requerido" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = id 
      ? `${apiUrl}/api/v1/public_personal_data/?id=${id}`
      : `${apiUrl}/api/v1/public_personal_data/?user_id=${userId}`;
      
    const res = await axios.get(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
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
