import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse";
}

export function LoadingSpinner({ className, size = "md", variant = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-current rounded-full animate-pulse",
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "bg-current rounded-full animate-pulse",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando..."
    />
  );
}

export function LoadingPage({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Loading states específicos
export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function LoadingTable({ message = "Cargando datos..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingForm({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Componente de overlay de loading
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Cargando...", 
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
      "flex items-center justify-center z-50",
      className
    )}>
      <div className="flex flex-col items-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Hook para manejar estados de loading
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  
  return {
    isLoading,
    startLoading,
    stopLoading
  };
}