import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/subject_messages/${params.id}`;

    const res = await axios.put(url, body, {
      headers: { 
        Cookie: cookieHeader,
        "Content-Type": "application/json"
      },
      withCredentials: true,
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Error in subject-messages/[id] PUT proxy:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Error updating subject message" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return NextResponse.json({ error: "No cookies found" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${apiUrl}/api/v1/subject_messages/${params.id}`;

    const res = await axios.delete(url, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Error in subject-messages/[id] DELETE proxy:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Error deleting subject message" },
      { status: error.response?.status || 500 }
    );
  }
}
