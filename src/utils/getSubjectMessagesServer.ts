import axios from "axios";
import https from "https";

interface SubjectMessage {
  id: number;
  sender_id: number;
  subject_id: number;
  title: string;
  content: string;
  created_at: string;
  type: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const getSubjectMessagesServer = async (token: string, subjectId: string, page?: number, limit?: number): Promise<SubjectMessage[]> => {
  try {
    if (!token) {
      console.log("No token provided to getSubjectMessagesServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const params = new URLSearchParams();
    params.append("subject_id", subjectId);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const res = await axios.get(`${apiUrl}/api/v1/subject_messages/?${params.toString()}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    // Handle paginated response
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return (res.data as PaginatedResponse<SubjectMessage>).data;
    }
    return res.data;
  } catch (error) {
    console.error("Server subject messages fetch error:", error);
    return [];
  }
};

export default getSubjectMessagesServer;
