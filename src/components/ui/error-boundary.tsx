"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/sacred";
import { cn } from "@/lib/utils";


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-14 h-14 bg-error-muted rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-7 h-7 text-error" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">
                Algo salió mal
              </h3>
              <p className="text-sm text-text-secondary">
                Ha ocurrido un error inesperado. Puedes intentar nuevamente o actualizar la página.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-text-muted hover:text-text-secondary">
                    Detalles del error (desarrollo)
                  </summary>
                  <pre className="mt-2 text-xs bg-surface-muted p-2 rounded-md overflow-auto text-text-secondary">
                    {this.state.error.message}
                    {"\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={this.handleRetry}
                size="sm"
              >
                Reintentar
              </Button>
              <Button
                onClick={this.handleRefresh}
                size="sm"
              >
                Actualizar pagina
              </Button>
            </div>
          </div>
        </div>

      );
    }

    return this.props.children;
  }
}

// Hook para error boundaries funcionales
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error("Error capturado:", error, errorInfo);
  }, []);
}


// Componente de error más simple para casos específicos
interface ErrorDisplayProps {
  error?: string | Error;
  retry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, retry, className = "" }: ErrorDisplayProps) {
  const errorMessage = typeof error === "string" ? error : error?.message || "Error desconocido";

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 space-y-4", className)}>
      <div className="w-12 h-12 bg-error-muted rounded-full flex items-center justify-center">
        <ExclamationTriangleIcon className="w-6 h-6 text-error" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-medium text-text-primary">
          Error al cargar
        </h3>
        <p className="text-sm text-text-secondary">
          {errorMessage}
        </p>
      </div>

      {retry && (
        <Button
          variant="secondary"
          onClick={retry}
          size="sm"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
