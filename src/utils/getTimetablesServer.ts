import axios from "axios";
import https from "https";

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const getTimetablesServer = async (token: string, courseId: string, page?: number, limit?: number): Promise<Timetable[]> => {
  try {
    if (!token) {
      console.log("No token provided to getTimetablesServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const params = new URLSearchParams();
    params.append("course_id", courseId);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const res = await axios.get(`${apiUrl}/api/v1/timetables/?${params.toString()}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    // Handle paginated response
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return (res.data as PaginatedResponse<Timetable>).data;
    }
    return res.data;
  } catch (error) {
    console.error("Server timetables fetch error:", error);
    return [];
  }
};

export default getTimetablesServer;
