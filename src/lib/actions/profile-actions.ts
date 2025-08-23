"use server";

import { cookies } from "next/headers";
import axios from "axios";

export async function uploadProfilePicture(clientFormData: FormData) {
  try {
    // 1. JWT
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    if (!jwtCookie) throw new Error("No JWT token found");

    // 2. Obtener archivo del form
    const file = clientFormData.get("file") as File;
    if (!file) throw new Error("No file provided");
    if (!file.type.startsWith("image/"))
      throw new Error("Only images are allowed");
    if (file.size > 10 * 1024 * 1024)
      throw new Error("File size exceeds 5MB limit");

    // 3. Crear FormData con el archivo real
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    // 4. POST al backend usando proxy
    await axios.post(
      `/api/proxy/profile-pictures`,
      uploadFormData,
      {
        headers: {
          Cookie: `jwt=${jwtCookie.value}`,
        },
        withCredentials: true,
      }
    );

    return { success: true, message: "Upload successful" };
  } catch (error) {
    console.error("Error uploading profile picture:", error);

    if (axios.isAxiosError(error)) {
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      if (error.response?.status === 401) {
        throw new Error("Unauthorized - JWT token might be invalid");
      }
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.message || "Invalid request format";
        throw new Error(`Upload failed: ${errorMessage}`);
      }
      throw new Error(
        `Upload failed: ${error.response?.status} - ${
          error.response?.data?.message || error.message
        }`
      );
    }

    throw error;
  }
}

export async function getProfilePicture() {
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    if (!jwtCookie) throw new Error("No JWT token found");
    
    const response = await axios.get(
      `/api/proxy/profile-pictures`,
      {
        headers: {
          Cookie: `jwt=${jwtCookie.value}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting profile picture:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        // No profile picture found, return null
        return null;
      }
      if (error.response?.status === 401) {
        throw new Error("Unauthorized - JWT token might be invalid");
      }
      throw new Error(
        `Failed to get profile picture: ${error.response?.status} - ${
          error.response?.data?.message || error.message
        }`
      );
    }

    throw error;
  }
}
