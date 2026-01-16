import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    
    if (!cookieHeader) {
      return NextResponse.json({ error: "No cookies found" }, { status: 401 });
    }
    
    if (!cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT cookie not found" }, { status: 401 });
    }
    
    // Extract JWT token
    const jwtMatch = cookieHeader.match(/jwt=([^;]+)/);
    const jwt = jwtMatch ? jwtMatch[1] : null;
    
    if (!jwt) {
      return NextResponse.json({ error: "JWT token is empty" }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: "JWT token found", 
      hasJwt: true,
      tokenLength: jwt.length 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      { error: "Error testing authentication" },
      { status: 500 }
    );
  }
}
