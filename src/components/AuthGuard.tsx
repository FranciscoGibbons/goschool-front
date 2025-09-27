"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import userInfoStore from '@/store/userInfoStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const router = useRouter();
  const { userInfo, checkAuth } = userInfoStore();

  useEffect(() => {
    // Verificación rápida de la cookie JWT del lado del cliente
    const checkAuthStatus = async () => {
      try {
        // Verificar si existe la cookie JWT
        const cookies = document.cookie.split(';').map(c => c.trim());
        const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt='));
        
        if (!jwtCookie) {
          // No hay cookie, redirigir inmediatamente
          router.push('/login');
          return;
        }

        // Si ya tenemos userInfo válido, mostrar contenido inmediatamente
        if (userInfo?.role) {
          console.log('✅ Usuario ya autenticado:', userInfo.role);
          setShouldRender(true);
          setIsChecking(false);
          return;
        }

        // Si hay cookie pero no userInfo, hacer verificación rápida
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          console.log('✅ Autenticación verificada');
          setShouldRender(true);
        } else {
          console.log('🔒 Autenticación fallida, redirigiendo...');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error en verificación de auth:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, [router, userInfo?.role, checkAuth]);

  // Mientras se verifica, mostrar solo el loader sin ningún contenido
  if (isChecking || !shouldRender) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}