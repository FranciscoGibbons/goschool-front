import axios from "axios";

const verifyToken = async (token: string) => {
  try {

    const res = await axios.get(`/api/proxy/verify-token`, {
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
