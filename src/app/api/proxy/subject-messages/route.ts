import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// GET handler to fetch subject messages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subject_id');
    
    if (!subjectId) {
      return NextResponse.json(
        { error: "Se requiere el parámetro subject_id" },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(
      `${apiUrl}/api/v1/subject_messages/?subject_id=${subjectId}`,
      {
        headers: { Cookie: cookieHeader },
        withCredentials: true,
      }
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Error al obtener mensajes de la materia";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener mensajes de la materia" },
      { status: 500 }
    );
  }
}

// POST handler to create a new subject message
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const formData = await req.formData();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    const res = await axios.post(`${apiUrl}/api/v1/subject_messages/`, formData, {
      headers: { 
        Cookie: cookieHeader,
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al crear mensaje de materia";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al crear mensaje de materia" },
      { status: 500 }
    );
  }
}
