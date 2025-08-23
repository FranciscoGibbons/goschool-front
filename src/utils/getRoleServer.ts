import axios from "axios";

const getRoleServer = async (token: string) => {
  try {
    if (!token) {
      console.log("No token provided to getRoleServer");
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/role/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Server role fetch error:", error);
    return null;
  }
};

export default getRoleServer;
