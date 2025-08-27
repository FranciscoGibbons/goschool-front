import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    console.log("Cookie header recibido en courses:", cookieHeader);
    
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      console.log("JWT no encontrado en cookies para courses");
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/courses/`;
    
    console.log("URL del backend para courses:", url);
    console.log("API URL para courses:", apiUrl);
    
    const res = await axios.get(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    console.log("Respuesta del backend para courses:", res.data);
    console.log("Status del backend para courses:", res.status);

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("Error en proxy de courses:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error de Axios en courses:", error.response?.data);
      console.error("Status del error en courses:", error.response?.status);
      const message = error.response?.data || "Error al obtener cursos";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener cursos" },
      { status: 500 }
    );
  }
}
