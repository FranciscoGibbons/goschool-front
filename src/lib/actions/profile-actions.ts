"use server";

import { cookies, headers } from "next/headers";
import axios from "axios";
import https from "https";

export async function uploadProfilePicture(clientFormData: FormData) {
  try {
    console.log("🚀 uploadProfilePicture - Iniciando server action...");
    
    // 1. JWT
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("jwt");
    if (!jwtCookie) throw new Error("No JWT token found");

    console.log("🍪 JWT encontrado en cookies");

    // 2. Obtener archivo del form
    const file = clientFormData.get("file") as File;
    if (!file) throw new Error("No file provided");
    if (!file.type.startsWith("image/"))
      throw new Error("Only images are allowed");
    if (file.size > 10 * 1024 * 1024)
      throw new Error("File size exceeds 5MB limit");

    console.log("📁 Archivo validado:", { name: file.name, size: file.size, type: file.type });

    // 3. Crear FormData con el archivo real
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    // 4. PUT al backend usando proxy
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3001';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    console.log("📤 Enviando PUT a:", `${baseUrl}/api/proxy/profile-pictures`);
    
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    await axios.put(
      `${baseUrl}/api/proxy/profile-pictures`,
      uploadFormData,
      {
        headers: {
          Cookie: `jwt=${jwtCookie.value}`,
        },
        withCredentials: true,
        httpsAgent: httpsAgent,
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
    
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    
    const response = await axios.get(
      `${baseUrl}/api/proxy/profile-pictures`,
      {
        headers: {
          Cookie: `jwt=${jwtCookie.value}`,
        },
        withCredentials: true,
        httpsAgent: httpsAgent,
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
