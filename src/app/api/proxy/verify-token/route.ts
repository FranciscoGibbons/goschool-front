import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  console.log('🔍 Iniciando verificación de token...');
  
  try {
    const cookieHeader = req.headers.get("cookie");
    console.log('🍪 Cookies recibidas:', cookieHeader?.substring(0, 50) + '...');
    
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      console.log('❌ No se encontró JWT en las cookies');
      return NextResponse.json(
        { error: "JWT no encontrado", success: false }, 
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!apiUrl) {
      console.error('❌ NEXT_PUBLIC_BACKEND_URL no está definido');
      return NextResponse.json(
        { error: "Error de configuración del servidor", success: false },
        { status: 500 }
      );
    }

    console.log(`🌐 Llamando a ${apiUrl}/api/v1/verify_token/`);
    const response = await axios.get(`${apiUrl}/api/v1/verify_token/`, {
      headers: { 
        Cookie: cookieHeader,
        'Accept': 'application/json'
      },
      withCredentials: true,
      validateStatus: () => true // Aceptar todos los códigos de estado
    });

    console.log('✅ Respuesta del backend:', {
      status: response.status,
      data: response.data
    });

    // Devolver la respuesta del backend con el mismo status
    return NextResponse.json(
      { ...response.data, success: response.status === 200 },
      { status: response.status }
    );
    
  } catch (error) {
    console.error('❌ Error en verify-token:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || "Error al verificar token";
      
      console.error(`⚠️ Error ${status}:`, message);
      return NextResponse.json(
        { error: message, success: false },
        { status }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Error desconocido al verificar token",
        success: false,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
