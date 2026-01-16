import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

const getRole = async () => {
  try {
    const role = await apiClient.get(API_ENDPOINTS.ROLE);
    return role;
  } catch (error) {
    console.error("Error getting role:", error);
    return null;
  }
};

export default getRole;
