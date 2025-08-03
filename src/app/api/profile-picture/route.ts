import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Get the JWT from cookies
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
      return NextResponse.json(
        { error: "No JWT token found" },
        { status: 401 }
      );
    }


    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // Fetch the image from the backend
    const response = await axios.get(
      `${apiUrl}/api/v1/profile_pictures/serve/${encodeURIComponent(
        filePath
      )}`,
      {
        headers: {
          Cookie: `jwt=${jwt}`,
        },
        responseType: "arraybuffer",
      }
    );

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
