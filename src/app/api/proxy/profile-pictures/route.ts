import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get(`${apiUrl}/api/v1/profile_pictures/`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return NextResponse.json(null, { status: 404 });
      }
      const message = error.response?.data || "Error al obtener foto de perfil";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener foto de perfil" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log(" POST /api/proxy/profile-pictures - Iniciando...");
    
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      console.log(" JWT no encontrado en headers");
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    console.log(" JWT encontrado, obteniendo formData...");
    
    const contentType = req.headers.get("content-type");
    console.log(" Content-Type:", contentType);
    
    let formData;
    if (contentType?.includes("multipart/form-data")) {
      try {
        formData = await req.formData();
        const file = formData.get("file") as File;
        console.log(" Archivo recibido:", {
          name: file?.name,
          size: file?.size,
          type: file?.type
        });
      } catch (error) {
        console.error(" Error parseando FormData:", error);
        return NextResponse.json({ error: "Error procesando archivo" }, { status: 400 });
      }
    } else {
      console.error(" Content-Type no es multipart/form-data");
      return NextResponse.json({ error: "Content-Type debe ser multipart/form-data" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log(" Backend URL:", apiUrl);
    
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    console.log(" Enviando POST al backend...");
    const res = await axios.post(`${apiUrl}/api/v1/profile_pictures/`, formData, {
      headers: { 
        Cookie: cookieHeader,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    console.log(" Respuesta exitosa del backend:", res.status);
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(" Error en POST proxy:", error);
    
    if (axios.isAxiosError(error)) {
      console.error(" Detalles del error axios:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      const message = error.response?.data || "Error al subir foto de perfil";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    
    console.error(" Error no-axios:", error);
    return NextResponse.json(
      { error: "Error desconocido al subir foto de perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "JWT no encontrado" }, { status: 401 });
    }

    const formData = await req.formData();
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.put(`${apiUrl}/api/v1/profile_pictures/`, formData, {
      headers: { 
        Cookie: cookieHeader,
      },
      withCredentials: true,
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data || "Error al actualizar foto de perfil";
      return NextResponse.json(
        { error: message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al actualizar foto de perfil" },
      { status: 500 }
    );
  }
}
