import React, { Suspense, lazy } from 'react';
import { LoadingCard } from './loading-spinner';
import { ErrorBoundary } from './error-boundary';

// Lazy loading específicos para componentes pesados
export const LazyExamList = lazy(() => import('@/app/(main)/examenes/components/ExamList'));

export const LazyGradesDisplay = lazy(() => import('@/app/(main)/calificaciones/components/GradesDisplay'));

export const LazyMessageList = lazy(() => import('@/app/(main)/mensajes/components/MessageList'));

export const LazyTimetableDisplay = lazy(() => import('@/app/(main)/horario/components/TimetableDisplay'));

export const LazySubjectSelector = lazy(() => import('@/app/(main)/asignaturas/components/SubjectSelector'));

// Wrapper componente para usar con lazy components
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function LazyWrapper({ 
  children, 
  fallback = <LoadingCard />, 
  errorFallback = <div>Error al cargar el componente</div> 
}: LazyWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Componente para preload de módulos
interface PreloadModuleProps {
  modulePath: string;
  children?: React.ReactNode;
}

export function PreloadModule({ modulePath, children }: PreloadModuleProps) {
  React.useEffect(() => {
    // Preload el módulo en idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import(modulePath).catch(() => {
          // Silently fail para no afectar la experiencia del usuario
        });
      });
    } else {
      // Fallback para navegadores sin requestIdleCallback
      setTimeout(() => {
        import(modulePath).catch(() => {});
      }, 100);
    }
  }, [modulePath]);

  return <>{children}</>;
}

// Hook para intersection observer (lazy loading basado en viewport)
export function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [elementRef, options]);

  return isIntersecting;
}

// Componente para lazy loading basado en viewport
interface LazyOnViewportProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyOnViewport({ children, fallback, className }: LazyOnViewportProps) {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const isInViewport = useIntersectionObserver(elementRef);

  return (
    <div ref={elementRef} className={className}>
      {isInViewport ? children : fallback || <LoadingCard />}
    </div>
  );
}

// Hook personalizado para image lazy loading
export function useImageLazyLoading(src: string) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Error al cargar la imagen');
      setIsLoading(false);
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, error, imgRef };
}