import axios from "axios";

const verifyTokenServer = async (token: string) => {
  try {
    if (!token) {
      console.log("No token provided to verifyTokenServer");
      return false;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/verify_token/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
    });
    return res.status === 200;
  } catch (error) {
    console.error("Server token verification error:", error);
    return false;
  }
};

export default verifyTokenServer;
