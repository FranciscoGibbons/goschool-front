import { NextRequest, NextResponse } from "next/server";
import https from "https";

// Use BACKEND_URL for server-side requests (Docker network), fallback to NEXT_PUBLIC for local dev
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://127.0.0.1';

// Create HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(request: NextRequest) {
  try {
    // Get the JWT from cookies
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
      console.log("[PROFILE PIC DEBUG] No JWT cookie found");
      return NextResponse.json(
        { error: "No JWT token found" },
        { status: 401 }
      );
    }

    const url = `${BACKEND_URL}/api/v1/profile_pictures/`;
    console.log("[PROFILE PIC DEBUG] Fetching from:", url);

    // Get the profile picture info from backend
    const response = await fetch(url, {
      headers: {
        'Cookie': `jwt=${jwt}`,
      },
      // @ts-expect-error - agent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    console.log("[PROFILE PIC DEBUG] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "No profile picture found" },
          { status: 404 }
        );
      }
      const text = await response.text();
      console.error("[PROFILE PIC DEBUG] Error response:", text);
      return NextResponse.json(
        { error: "Failed to get profile picture" },
        { status: response.status }
      );
    }

    const profileInfo = await response.json();
    console.log("[PROFILE PIC DEBUG] Profile info:", profileInfo);

    if (!profileInfo?.url) {
      return NextResponse.json(
        { error: "No profile picture found" },
        { status: 404 }
      );
    }

    // Return the URL instead of proxying the image
    // This allows the client to access it directly
    return NextResponse.json({ url: profileInfo.url }, { status: 200 });
  } catch (error) {
    console.error("[PROFILE PIC DEBUG] Error:", error);

    return NextResponse.json(
      { error: "Failed to get profile picture info" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the JWT from cookies
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
      console.log("[PROFILE PIC DEBUG] PUT: No JWT cookie found");
      return NextResponse.json(
        { error: "No JWT token found" },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    console.log("[PROFILE PIC DEBUG] PUT: Uploading profile picture");

    const url = `${BACKEND_URL}/api/v1/profile_pictures/`;
    console.log("[PROFILE PIC DEBUG] PUT: Sending to:", url);

    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Cookie': `jwt=${jwt}`,
      },
      body: formData,
      // @ts-expect-error - agent is valid for node-fetch
      agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
    });

    console.log("[PROFILE PIC DEBUG] PUT: Response status:", response.status);

    // Handle empty responses
    const text = await response.text();
    const data = text && text.trim() ? JSON.parse(text) : { success: true };

    if (!response.ok) {
      console.error("[PROFILE PIC DEBUG] PUT: Error response:", data);
      return NextResponse.json(
        { error: data.error || "Failed to update profile picture" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[PROFILE PIC DEBUG] PUT: Error:", error);

    return NextResponse.json(
      { error: "Failed to update profile picture" },
      { status: 500 }
    );
  }
}
