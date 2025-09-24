import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import https from "https";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://163.176.141.4";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const cookies = req.headers.get("cookie") || "";
    
    const res = await axios.put(`${apiUrl}/api/v1/homework_submission/${id}`, body, {
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error in submission PUT proxy:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response?.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Error updating submission" },
      { status: axiosError.response?.status || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = req.headers.get("cookie") || "";
    
    const res = await axios.delete(`${apiUrl}/api/v1/homework_submission/${id}`, {
      headers: {
        Cookie: cookies,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error in submission DELETE proxy:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response?.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Error deleting submission" },
      { status: axiosError.response?.status || 500 }
    );
  }
}