import axios from "axios";

const verifyToken = async (token: string) => {
  try {

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/verify_token/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
    });
    return res.status === 200; // Si la respuesta es 200, el token es válido
  } catch {
    return false; // Si ocurre un error, el token no es válido
  }
};

export default verifyToken;
