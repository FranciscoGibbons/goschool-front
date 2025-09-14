import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/get_if_selfassessable_answered/`;

    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.post(url, body, {
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
    console.error("Error in get-if-selfassessable-answered proxy:", axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { error: "Error checking selfassessable status" },
      { status: axiosError.response?.status || 500 }
    );
  }
}
