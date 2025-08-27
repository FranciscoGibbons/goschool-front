import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verificar que se haya proporcionado el campo "role"
    if (!body.role) {
      return NextResponse.json(
        { error: 'Falta el campo "role"' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    const res = await axios.post(`${apiUrl}/api/v1/login/`, body, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    // Extraer la cookie JWT del backend
    const setCookieHeader = res.headers["set-cookie"];
    let jwtToken = null;
    
    if (setCookieHeader) {
      // Buscar la cookie jwt en las cookies del backend
      for (const cookie of setCookieHeader) {
        if (cookie.includes("jwt=")) {
          const jwtMatch = cookie.match(/jwt=([^;]+)/);
          if (jwtMatch) {
            jwtToken = jwtMatch[1];
            break;
          }
        }
      }
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    
    // Establecer la cookie JWT en el frontend
    if (jwtToken) {
      response.cookies.set("jwt", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
    }

    return response;
  } catch (error) {
    console.error("Error al hacer login:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      // Devolver el error específico del backend si está disponible
      if (error.response?.data) {
        return NextResponse.json(
          { error: error.response.data },
          { status: error.response.status || 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 400 }
    );
  }
}
