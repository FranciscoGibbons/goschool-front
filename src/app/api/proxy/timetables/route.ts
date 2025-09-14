import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("course_id");

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = courseId
      ? `${apiUrl}/api/v1/timetables/?course_id=${courseId}`
      : `${apiUrl}/api/v1/timetables/`;

    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(url, {
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
    console.error("Error in timetables proxy:", axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { error: "Error fetching timetables" },
      { status: axiosError.response?.status || 500 }
    );
  }
}
