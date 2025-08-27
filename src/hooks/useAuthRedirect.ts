import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import userInfoStore from '@/store/userInfoStore';

export function useAuthRedirect(requiredRole?: string) {
  const router = useRouter();
  const { userInfo, checkAuth, isLoading } = userInfoStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();
        
        if (!isMounted) return;

        if (!isAuthenticated) {
          console.log('🔒 No autenticado, redirigiendo a login...');
          router.push('/login');
          return;
        }

        if (requiredRole && userInfo?.role !== requiredRole) {
          console.log(`⚠️ Rol ${userInfo?.role} no tiene permiso para acceder a esta ruta`);
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error en verificación de autenticación:', error);
        if (isMounted) {
          router.push('/login');
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuth, router, requiredRole, userInfo?.role]);

  return { isAuthorized, isLoading: isLoading || isChecking };
}
