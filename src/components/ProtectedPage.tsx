import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import userInfoStore from '@/store/userInfoStore';
import { LoadingPage } from '@/components/ui/loading-spinner';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

export function ProtectedPage({ children, requiredRole, allowedRoles }: ProtectedPageProps) {
  const router = useRouter();
  const { userInfo, checkAuth, isLoading } = userInfoStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        console.log('🔄 ProtectedPage: Verificando autenticación...');
        
        // Primero verificar si ya tenemos userInfo válido
        if (userInfo?.role) {
          console.log('✅ ProtectedPage: Usuario ya autenticado:', userInfo.role);
          
          // Verificar permisos
          if (requiredRole && userInfo.role !== requiredRole) {
            console.log('❌ ProtectedPage: Rol requerido no coincide');
            router.push('/dashboard'); // Redirigir a dashboard en lugar de login
            return;
          }

          if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
            console.log('❌ ProtectedPage: Rol no está en lista permitida');
            router.push('/dashboard'); // Redirigir a dashboard en lugar de login
            return;
          }

          setIsAuthorized(true);
          return;
        }

        // Verificar autenticación con el servidor
        console.log('🔍 ProtectedPage: Verificando con servidor...');
        const authenticated = await checkAuth();
        
        if (!authenticated) {
          console.log('❌ ProtectedPage: No autenticado, redirigiendo a login');
          router.replace('/login'); // Usar replace en lugar de push
          return;
        }

        // Después de checkAuth, verificar userInfo nuevamente
        const updatedUserInfo = userInfoStore.getState().userInfo;
        if (updatedUserInfo?.role) {
          // Verificar permisos
          if (requiredRole && updatedUserInfo.role !== requiredRole) {
            console.log('❌ ProtectedPage: Rol requerido no coincide después de auth');
            router.replace('/dashboard');
            return;
          }

          if (allowedRoles && !allowedRoles.includes(updatedUserInfo.role)) {
            console.log('❌ ProtectedPage: Rol no permitido después de auth');
            router.replace('/dashboard');
            return;
          }
        }

        setIsAuthorized(true);
        console.log('✅ ProtectedPage: Autorización completada');
        
      } catch (error) {
        console.error('❌ ProtectedPage: Error en verificación:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.role, requiredRole, allowedRoles]); // checkAuth and router are stable refs

  // Si está cargando la verificación o el store, mostrar loading
  if (isLoading || isChecking) {
    return <LoadingPage message="Verificando autenticación..." />;
  }

  // Si no está autorizado, mostrar loading mientras redirige
  if (!isAuthorized) {
    return <LoadingPage message="Acceso denegado. Redirigiendo..." />;
  }

  // Todo está bien, mostrar el contenido
  return <>{children}</>;
}