import axios from "axios";
import https from "https";
import { Exam } from "./types";

const getExamsServer = async (token: string): Promise<Exam[]> => {
  try {
    if (!token) {
      console.log("No token provided to getExamsServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/assessments/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });
    return res.data;
  } catch (error) {
    console.error("Server exams fetch error:", error);
    return [];
  }
};

export default getExamsServer;
