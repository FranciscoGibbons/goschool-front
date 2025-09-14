import axios from "axios";
import https from "https";

const checkSelfassessableAnsweredServer = async (token: string, selfassessableId: number) => {
  try {
    if (!token) {
      console.log("No token provided to checkSelfassessableAnsweredServer");
      return false;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.post(`${apiUrl}/api/v1/get_if_selfassessable_answered/`, 
      { selfassessable_id: selfassessableId },
      {
        headers: {
          Cookie: `jwt=${token}`,
          "Content-Type": "application/json"
        },
        withCredentials: true,
        httpsAgent: httpsAgent,
      }
    );
    
    let isAnswered = false;
    if (typeof res.data === "boolean") isAnswered = res.data;
    else if (typeof res.data === "string")
      isAnswered = res.data.toLowerCase() === "true";
    else if (typeof res.data === "number") isAnswered = res.data === 1;
    else if (res.data && typeof res.data === "object")
      isAnswered =
        res.data.answered ||
        res.data.is_answered ||
        res.data.completed ||
        false;
    
    return isAnswered;
  } catch (error) {
    console.error("Server selfassessable answered check error:", error);
    return false;
  }
};

export default checkSelfassessableAnsweredServer;
