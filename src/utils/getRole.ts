import axios from "axios";

const getRole = async (token: string) => {
  try {
  
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/role/`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    return null;
  }
};
export default getRole;
