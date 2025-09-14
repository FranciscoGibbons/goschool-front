import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

interface Params {
  id: string;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/subject_messages/${params.id}`;

    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.put(url, body, {
      headers: { 
        Cookie: cookieHeader,
        "Content-Type": "application/json"
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        data?: unknown;
        status?: number;
      };
      message?: string;
    };
    console.error("Error in subject-messages/[id] PUT proxy:", axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { error: "Error updating subject message" },
      { status: axiosError.response?.status || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/subject_messages/${params.id}`;

    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.delete(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        data?: unknown;
        status?: number;
      };
      message?: string;
    };
    console.error("Error in subject-messages/[id] DELETE proxy:", axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { error: "Error deleting subject message" },
      { status: axiosError.response?.status || 500 }
    );
  }
}
