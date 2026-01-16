import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import userInfoStore from '@/store/userInfoStore';

interface UseAuthRedirectOptions {
  requiredRole?: string;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { requiredRole, redirectTo = '/dashboard', allowedRoles } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userInfo, checkAuth, isLoading } = userInfoStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const handleRedirect = useCallback((path: string) => {
    const from = searchParams.get('from');
    router.push(from && from !== '/login' ? from : path);
  }, [router, searchParams]);

  const verifyAuth = useCallback(async () => {
    try {
      setIsChecking(true);
      
      console.log('🔄 Iniciando verificación de autenticación...');
      
      // Si ya tenemos userInfo válido, verificar permisos directamente sin hacer nueva llamada
      if (userInfo?.role) {
        console.log('✅ Usando userInfo existente:', userInfo.role);
        
        // Verificar rol específico requerido
        if (requiredRole && userInfo.role !== requiredRole) {
          console.log(`⚠️ Rol ${userInfo.role} no tiene permiso para acceder a esta ruta`);
          handleRedirect(redirectTo);
          return;
        }

        // Verificar roles permitidos
        if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
          console.log(`⚠️ Rol ${userInfo.role} no está en la lista de roles permitidos`);
          handleRedirect(redirectTo);
          return;
        }

        setIsAuthorized(true);
        return;
      }
      
      // Hacer checkAuth que incluye su propia verificación de cookies
      console.log('🔄 Verificando token con backend...');
      const isAuthenticated = await checkAuth();
      
      if (!isAuthenticated) {
        console.log('🔒 No autenticado, redirigiendo a login...');
        router.push('/login');
        return;
      }

      // Después de checkAuth, el userInfo debería estar disponible
      const updatedUserInfo = userInfoStore.getState().userInfo;
      
      if (updatedUserInfo?.role) {
        // Verificar rol específico requerido
        if (requiredRole && updatedUserInfo.role !== requiredRole) {
          console.log(`⚠️ Rol ${updatedUserInfo.role} no tiene permiso para acceder a esta ruta`);
          handleRedirect(redirectTo);
          return;
        }

        // Verificar roles permitidos
        if (allowedRoles && !allowedRoles.includes(updatedUserInfo.role)) {
          console.log(`⚠️ Rol ${updatedUserInfo.role} no está en la lista de roles permitidos`);
          handleRedirect(redirectTo);
          return;
        }
      }
      
      setIsAuthorized(true);

    } catch (error) {
      console.error('Error en verificación de autenticación:', error);
      router.push('/login');
    } finally {
      setIsChecking(false);
    }
  }, [checkAuth, userInfo?.role, requiredRole, allowedRoles, router, redirectTo, handleRedirect]);

  useEffect(() => {
    // Si ya está autorizado, no hacer nueva verificación
    if (isAuthorized) return;
    
    // Solo verificar si no está cargando
    if (!isLoading) {
      verifyAuth();
    }
  }, [verifyAuth, isAuthorized, isLoading]);

  // Re-verificar cuando cambie el rol del usuario
  useEffect(() => {
    if (userInfo?.role && isAuthorized) {
      if (requiredRole && userInfo.role !== requiredRole) {
        setIsAuthorized(false);
        handleRedirect(redirectTo);
      } else if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
        setIsAuthorized(false);
        handleRedirect(redirectTo);
      }
    }
  }, [userInfo?.role, requiredRole, allowedRoles, isAuthorized, handleRedirect, redirectTo]);

  return { 
    isAuthorized, 
    isLoading: isLoading || isChecking,
    userRole: userInfo?.role || null,
    retry: verifyAuth
  };
}
