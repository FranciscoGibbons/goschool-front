import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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

    const res = await axios.get(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Error in timetables proxy:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Error fetching timetables" },
      { status: error.response?.status || 500 }
    );
  }
}
