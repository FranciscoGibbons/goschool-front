import axios from "axios";
import https from "https";

const getTimetablesServer = async (token: string, courseId: string) => {
  try {
    if (!token) {
      console.log("No token provided to getTimetablesServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/timetables/?course_id=${courseId}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });
    return res.data;
  } catch (error) {
    console.error("Server timetables fetch error:", error);
    return [];
  }
};

export default getTimetablesServer;
