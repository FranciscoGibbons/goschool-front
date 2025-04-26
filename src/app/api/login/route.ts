import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();

  // Verificar que se haya proporcionado el campo "role"
  if (!body.role) {
    return NextResponse.json(
      { error: 'Falta el campo "role"' },
      { status: 400 }
    );
  }

  try {
    // Enviar los datos con el rol al backend
    const res = await axios.post("http://127.0.0.1:8080/api/v1/login/", body, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    // Transmitir la cookie de sesión al cliente
    const setCookie = res.headers["set-cookie"];

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": setCookie?.join("; ") || "",
      },
    });
  } catch (error) {
    console.error("Error al hacer login:", error);
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 400 }
    );
  }
}
