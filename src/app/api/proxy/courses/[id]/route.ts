import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/courses/${params.id}`;

    const res = await axios.get(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Error in courses/[id] proxy:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Error fetching course" },
      { status: error.response?.status || 500 }
    );
  }
}
