import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    console.log("Cookie header recibido:", cookieHeader);
    
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      console.log("JWT no encontrado en cookies");
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("course_id");
    console.log("Course ID recibido:", courseId);

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = courseId 
      ? `${apiUrl}/api/v1/subjects/?course_id=${courseId}`
      : `${apiUrl}/api/v1/subjects/`;
    
    console.log("URL del backend:", url);
    console.log("API URL:", apiUrl);
      
    const res = await axios.get(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    console.log("Respuesta del backend:", res.data);
    console.log("Status del backend:", res.status);

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("Error en proxy de subjects:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error de Axios:", error.response?.data);
      console.error("Status del error:", error.response?.status);
      const message = error.response?.data || "Error al obtener materias";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener materias" },
      { status: 500 }
    );
  }
}
