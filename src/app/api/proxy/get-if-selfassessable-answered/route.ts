import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/get_if_selfassessable_answered/`;

    const res = await axios.post(url, body, {
      headers: { 
        Cookie: cookieHeader,
        "Content-Type": "application/json"
      },
      withCredentials: true,
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Error in get-if-selfassessable-answered proxy:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Error checking selfassessable status" },
      { status: error.response?.status || 500 }
    );
  }
}
