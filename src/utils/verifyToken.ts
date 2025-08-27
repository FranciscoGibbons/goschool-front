import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

const verifyToken = async () => {
  try {
    const isValid = await apiClient.get(API_ENDPOINTS.VERIFY_TOKEN);
    return isValid;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

export default verifyToken;
