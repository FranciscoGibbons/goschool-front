import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import https from "https";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://163.176.141.4";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");
    const taskId = searchParams.get("task_id");
    const subjectId = searchParams.get("subject_id");
    const courseId = searchParams.get("course_id");
    
    // Construir query string para filtros
    const queryParams = new URLSearchParams();
    if (studentId) queryParams.append("student_id", studentId);
    if (taskId) queryParams.append("task_id", taskId);
    if (subjectId) queryParams.append("subject_id", subjectId);
    if (courseId) queryParams.append("course_id", courseId);
    
    const queryString = queryParams.toString();
    const url = `${apiUrl}/api/v1/homework_submission/${queryString ? `?${queryString}` : ""}`;
    
    // Obtener cookies del request
    const cookies = req.headers.get("cookie") || "";
    
    const res = await axios.get(url, {
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    return NextResponse.json(res.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error in submissions proxy:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response?.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Error fetching submissions data" },
      { status: axiosError.response?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Para submissions de archivos, necesitamos manejar FormData
    const formData = await req.formData();
    
    // Obtener cookies del request
    const cookies = req.headers.get("cookie") || "";
    
    const res = await axios.post(`${apiUrl}/api/v1/homework_submission/`, formData, {
      headers: {
        Cookie: cookies,
        "Content-Type": "multipart/form-data",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error in submissions proxy POST:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response?.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Error creating submission" },
      { status: axiosError.response?.status || 500 }
    );
  }
}