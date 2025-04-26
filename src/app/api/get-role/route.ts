import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const res = await axios.get("http://localhost:8080/api/v1/get_role/", {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json({ roles: res.data }, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al obtener roles";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener roles" },
      { status: 500 }
    );
  }
}
