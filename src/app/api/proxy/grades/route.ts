import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    // Obtener las cookies de la solicitud
    const cookieHeader = req.headers.get("cookie") || '';
    
    // Verificar si tenemos el token JWT
    if (!cookieHeader.includes("jwt=")) {
      console.error('JWT no encontrado en las cookies');
      return NextResponse.json(
        { error: "No autorizado - Token JWT no encontrado" }, 
        { status: 401 }
      );
    }

    // Obtener el cuerpo de la solicitud
    const body = await req.json();
    console.log('Solicitud de calificación recibida:', JSON.stringify(body, null, 2));
    
    // URL del backend
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://34.39.136.245';
    const targetUrl = `${apiUrl}/api/v1/grades/`;
    
    console.log('Enviando solicitud a:', targetUrl);
    
    // Configuración de la solicitud al backend
    const config = {
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Accept': 'application/json',
      },
      withCredentials: true,
      timeout: 10000, // 10 segundos de timeout
    };
    
    // Realizar la solicitud al backend
    const response = await axios.post(targetUrl, body, config);
    
    // Devolver la respuesta del backend
    return NextResponse.json(response.data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error: unknown) {
    console.error('Error en el proxy de calificaciones:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Error al procesar la calificación' };
      
      console.error(`Error ${status}:`, data);
      
      return NextResponse.json(
        typeof data === 'object' ? data : { error: String(data) },
        { status }
      );
    }
    
    // Error desconocido
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la calificación' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Obtener las cookies de la solicitud
    const cookieHeader = req.headers.get("cookie") || '';
    
    // Verificar si tenemos el token JWT
    if (!cookieHeader.includes("jwt=")) {
      console.error('JWT no encontrado en las cookies (GET)');
      return NextResponse.json(
        { error: "No autorizado - Token JWT no encontrado" }, 
        { status: 401 }
      );
    }

    // URL del backend
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://34.39.136.245';
    const targetUrl = `${apiUrl}/api/v1/grades/`;
    
    console.log('Solicitud GET a:', targetUrl);
    
    // Configuración de la solicitud al backend
    const config = {
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Accept': 'application/json',
      },
      withCredentials: true,
      timeout: 10000, // 10 segundos de timeout
    };
    
    // Realizar la solicitud al backend
    const response = await axios.get(targetUrl, config);
    
    // Devolver la respuesta del backend
    return NextResponse.json(response.data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error en el proxy de calificaciones (GET):', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Error al obtener las calificaciones' };
      
      console.error(`Error ${status}:`, data);
      
      return NextResponse.json(
        typeof data === 'object' ? data : { error: String(data) },
        { status }
      );
    }
    
    // Error desconocido
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las calificaciones' },
      { status: 500 }
    );
  }
}
