import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("course_id");

    if (!courseId) {
      return NextResponse.json({ error: "course_id es requerido" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/students/?course_id=${courseId}`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al obtener estudiantes";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener estudiantes" },
      { status: 500 }
    );
  }
}
