import axios from "axios";
import https from "https";

const getSubjectsServer = async (token: string): Promise<{ id: number; name: string }[]> => {
  try {
    if (!token) {
      console.log("No token provided to getSubjectsServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/subjects/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });
    return res.data;
  } catch (error) {
    console.error("Server subjects fetch error:", error);
    return [];
  }
};

export default getSubjectsServer;
