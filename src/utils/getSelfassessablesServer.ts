import axios from "axios";
import https from "https";

const getSelfassessablesServer = async (token: string, assessmentId: string) => {
  try {
    if (!token) {
      console.log("No token provided to getSelfassessablesServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/selfassessables/?assessment_id=${assessmentId}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });
    return res.data;
  } catch (error) {
    console.error("Server selfassessables fetch error:", error);
    return [];
  }
};

export default getSelfassessablesServer;
