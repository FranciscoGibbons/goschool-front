import axios from "axios";
import https from "https";

interface Subject {
  id: number;
  name: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const getSubjectsServer = async (token: string, page?: number, limit?: number): Promise<Subject[]> => {
  try {
    if (!token) {
      console.log("No token provided to getSubjectsServer");
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

    const res = await axios.get(`${apiUrl}/api/v1/subjects/${queryString ? `?${queryString}` : ""}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    // Handle paginated response
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return (res.data as PaginatedResponse<Subject>).data;
    }
    return res.data;
  } catch (error) {
    console.error("Server subjects fetch error:", error);
    return [];
  }
};

export default getSubjectsServer;
