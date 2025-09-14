import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function GET(request: NextRequest) {
  try {
    // Get the JWT from cookies
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
      return NextResponse.json(
        { error: "No JWT token found" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    
    // Get the profile picture info from backend
    const profileInfoResponse = await axios.get(
      `${apiUrl}/api/v1/profile_pictures/`,
      {
        headers: {
          Cookie: `jwt=${jwt}`,
        },
        httpsAgent: httpsAgent,
      }
    );

    const profileInfo = profileInfoResponse.data;
    if (!profileInfo?.url) {
      return NextResponse.json(
        { error: "No profile picture found" },
        { status: 404 }
      );
    }

    // Use the URL directly from the backend
    const response = await axios.get(profileInfo.url, {
      headers: {
        Cookie: `jwt=${jwt}`,
      },
      responseType: "arraybuffer",
      httpsAgent: httpsAgent,
    });

    // Return the image with proper headers
    return new NextResponse(response.data, {
      headers: {
        "Content-Type": response.headers["content-type"] || "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving profile picture:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the JWT from cookies
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
      return NextResponse.json(
        { error: "No JWT token found" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Create HTTPS agent for self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the request to the backend
    const response = await axios.put(
      `${apiUrl}/api/v1/profile_pictures/`,
      formData,
      {
        headers: {
          Cookie: `jwt=${jwt}`,
          'Content-Type': 'multipart/form-data',
        },
        httpsAgent: httpsAgent,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "Failed to update profile picture" },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update profile picture" },
      { status: 500 }
    );
  }
}
