"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { branding, brandingMeta } from "@/config/branding";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de recuperación no válido o expirado.");
    }
  }, [token]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token de recuperación no válido.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/proxy/reset-password", {
        token,
        password,
      }, {
        validateStatus: () => true,
      });

      if (response.status === 200) {
        setSuccess(true);
      } else if (response.status === 401) {
        setError("El enlace de recuperación ha expirado o ya fue utilizado.");
      } else {
        setError("No se pudo restablecer la contraseña. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Verifica tu conexión a internet.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 bg-surface p-6 sm:p-8 rounded-lg border border-border">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Contraseña actualizada
            </h2>
            <p className="text-text-secondary">
              Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3 px-4 rounded-md bg-primary text-primary-foreground text-center font-medium hover:bg-primary/90 transition-colors"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 bg-surface p-6 sm:p-8 rounded-lg border border-border">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Enlace no válido
            </h2>
            <p className="text-text-secondary">
              El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="block w-full py-3 px-4 rounded-md bg-primary text-primary-foreground text-center font-medium hover:bg-primary/90 transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-surface p-6 sm:p-8 rounded-lg border border-border">
        <div className="text-center">
          <div className="w-20 mx-auto mb-4">
            <Image
              src={branding.logoPath}
              alt={brandingMeta.logoAlt}
              width={80}
              height={40}
              className="w-full h-auto"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Nueva contraseña
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            Ingresa tu nueva contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Nueva contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground transition-all duration-200"
              placeholder="Mínimo 8 caracteres"
              required
              autoComplete="new-password"
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground"
            >
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground transition-all duration-200"
              placeholder="Repite tu contraseña"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Guardando...
              </div>
            ) : (
              "Restablecer contraseña"
            )}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
