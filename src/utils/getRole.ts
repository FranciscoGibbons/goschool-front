import axios from "axios";

const getRole = async (token: string) => {
  try {
  
    const res = await axios.get(`/api/proxy/role`, {
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
