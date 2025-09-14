import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

interface Params {
  path: string[];
}

export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params;
  return handleRequest(req, params, "GET");
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params;
  return handleRequest(req, params, "POST");
}

export async function PUT(req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params;
  return handleRequest(req, params, "PUT");
}

export async function DELETE(req: NextRequest, context: { params: Promise<Params> }) {
  const params = await context.params;
  return handleRequest(req, params, "DELETE");
}

async function handleRequest(
  req: NextRequest,
  params: Params,
  method: string
) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://34.39.136.245';
    const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
    const url = `${apiUrl}/api/v1/${path}${searchParams ? `?${searchParams}` : ""}`;

    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const config: {
      headers: Record<string, string>;
      withCredentials: boolean;
      httpsAgent: https.Agent;
      data?: unknown;
    } = {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
      httpsAgent: httpsAgent,
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