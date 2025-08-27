import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(req, await Promise.resolve(context.params), "GET");
}

export async function POST(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(req, await Promise.resolve(context.params), "POST");
}

export async function PUT(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(req, await Promise.resolve(context.params), "PUT");
}

export async function DELETE(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(req, await Promise.resolve(context.params), "DELETE");
}

async function handleRequest(
  req: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const path = params.path.join("/");
    const searchParams = req.nextUrl.searchParams.toString();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/${path}${searchParams ? `?${searchParams}` : ""}`;

    let config: any = {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    };

    let data;
    if (method === "POST" || method === "PUT") {
      const contentType = req.headers.get("content-type");
      if (contentType?.includes("multipart/form-data")) {
        data = await req.formData();
      } else {
        data = await req.json();
      }
      config.data = data;
    }

    const res = await axios({
      method,
      url,
      ...config,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error en la petición";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido en la petición" },
      { status: 500 }
    );
  }
}
