"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

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
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Algo salió mal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ha ocurrido un error inesperado. Puedes intentar nuevamente o actualizar la página.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    Detalles del error (desarrollo)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={this.handleRetry}
                size="sm"
              >
                Reintentar
              </Button>
              <Button 
                onClick={this.handleRefresh}
                size="sm"
              >
                Actualizar página
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
    console.error('Error capturado:', error, errorInfo);
    // Aquí podrías enviar el error a un servicio de monitoreo
  }, []);
}

// Componente de error más simple para casos específicos
interface ErrorDisplayProps {
  error?: string | Error;
  retry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, retry, className = "" }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Error desconocido';

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}>
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Error al cargar
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {errorMessage}
        </p>
      </div>

      {retry && (
        <Button 
          variant="outline" 
          onClick={retry}
          size="sm"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}