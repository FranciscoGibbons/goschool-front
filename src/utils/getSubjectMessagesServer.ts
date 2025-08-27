import axios from "axios";

const getSubjectMessagesServer = async (token: string, subjectId: string) => {
  try {
    if (!token) {
      console.log("No token provided to getSubjectMessagesServer");
      return [];
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await axios.get(`${apiUrl}/api/v1/subject_messages/?subject_id=${subjectId}`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Server subject messages fetch error:", error);
    return [];
  }
};

export default getSubjectMessagesServer;
