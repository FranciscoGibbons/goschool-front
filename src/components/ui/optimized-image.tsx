import Image, { ImageProps } from 'next/image';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { branding, brandingMeta } from '@/config/branding';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  showLoader?: boolean;
  loaderClassName?: string;
  errorClassName?: string;
  onLoadComplete?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/default.jpg',
  className,
  containerClassName,
  showLoader = true,
  loaderClassName,
  errorClassName,
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {isLoading && showLoader && (
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-muted',

            loaderClassName
          )}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          imageError ? errorClassName : className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={props.priority}
        quality={props.quality || 85}
        placeholder={props.placeholder || 'blur'}
        blurDataURL={props.blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='}
        {...props}
      />
    </div>
  );
}

// Componente para avatar con fallback
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 'md', 
  fallbackInitials,
  className 
}: AvatarImageProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  if (!src || imageError) {
    return (
        <div 
          className={cn(
            'rounded-full bg-gradient-to-br from-gradient-start via-gradient-mid to-gradient-end flex items-center justify-center text-white font-semibold',
            sizeClasses[size],
            className
          )}
        >

        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 64px, 96px"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

// Componente para logos e imágenes institucionales
interface LogoImageProps {
  variant?: 'primary' | 'secondary' | 'light';

  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoImage({ variant = 'primary', size = 'md', className }: LogoImageProps) {
  const logoSources = {
    primary: branding.logoPath,
    secondary: branding.logoSecondaryPath,
    light: branding.logoLightPath
  };


  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <OptimizedImage
      src={logoSources[variant]}
      alt={brandingMeta.logoAlt}
      width={200}
      height={80}
      className={cn(sizeClasses[size], className)}
      priority
      quality={90}
    />
  );
}

// Hook para preload de imágenes críticas
export function useImagePreload(imageSources: string[]) {
  React.useEffect(() => {
    imageSources.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup: remover los preloads al desmontar
      imageSources.forEach(src => {
        const existingLink = document.querySelector(`link[href="${src}"]`);
        if (existingLink) {
          document.head.removeChild(existingLink);
        }
      });
    };
  }, [imageSources]);
}

// Componente para imágenes con lazy loading basado en viewport
interface LazyImageProps extends OptimizedImageProps {
  rootMargin?: string;
  threshold?: number;
}

export function LazyImage({ 
  rootMargin = '50px', 
  threshold = 0.1, 
  ...props 
}: LazyImageProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={imgRef} className={props.containerClassName}>
      {shouldLoad ? (
        <OptimizedImage {...props} />
      ) : (
        <div 
          className={cn(
            'bg-muted animate-pulse',

            props.className
          )}
          style={{ 
            width: props.width, 
            height: props.height 
          }}
        />
      )}
    </div>
  );
}