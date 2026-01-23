import axios from "axios";
import https from "https";
import { Exam } from "./types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const getExamsServer = async (token: string, page?: number, limit?: number): Promise<Exam[]> => {
  try {
    if (!token) {
      console.log("No token provided to getExamsServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const queryString = params.toString();

    const res = await axios.get(`${apiUrl}/api/v1/assessments/${queryString ? `?${queryString}` : ""}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    // Handle paginated response
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return (res.data as PaginatedResponse<Exam>).data;
    }
    return res.data;
  } catch (error) {
    console.error("Server exams fetch error:", error);
    return [];
  }
};

export default getExamsServer;
