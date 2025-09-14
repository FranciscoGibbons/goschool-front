import axios from "axios";
import https from "https";

const getCourseServer = async (token: string, courseId: string) => {
  try {
    if (!token) {
      console.log("No token provided to getCourseServer");
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/courses/${courseId}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });
    return res.data;
  } catch (error) {
    console.error("Server course fetch error:", error);
    return null;
  }
};

export default getCourseServer;
