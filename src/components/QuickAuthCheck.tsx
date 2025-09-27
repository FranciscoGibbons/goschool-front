"use client";

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface QuickAuthCheckProps {
  children: React.ReactNode;
  showSpinner?: boolean;
}

export function QuickAuthCheck({ children, showSpinner = true }: QuickAuthCheckProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Solo hacer una verificación rápida de cookie sin redirección
    // Dejar que useAuthRedirect maneje toda la lógica de redirección
    const cookies = document.cookie.split(';').map(c => c.trim());
    const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt='));
    
    if (!jwtCookie) {
      // Si no hay cookie, no mostrar el contenido pero no redirigir aquí
      // useAuthRedirect se encargará de la redirección
      setShouldRender(false);
    } else {
      // Si hay cookie, permitir renderizar
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) {
    return showSpinner ? (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    ) : null;
  }

  return <>{children}</>;
}