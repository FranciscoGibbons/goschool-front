import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("Solicitando roles para:", body); // Log para verificar los datos recibidos

  try {
    // Aquí hacemos la solicitud POST al backend
    const res = await axios.post("http://localhost:8080/api/v1/roles/", body, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Si necesitas enviar cookies
    });

    console.log("Respuesta de los roles:", res.data);

    // Si todo es correcto, devolver los roles
    return NextResponse.json({ roles: res.data }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return NextResponse.json(
      { error: "Error al obtener roles" },
      { status: 500 }
    );
  }
}
