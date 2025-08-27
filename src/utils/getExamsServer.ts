import axios from "axios";
import { Exam } from "./types";

const getExamsServer = async (token: string): Promise<Exam[]> => {
  try {
    if (!token) {
      console.log("No token provided to getExamsServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/assessments/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Server exams fetch error:", error);
    return [];
  }
};

export default getExamsServer;
