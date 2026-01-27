"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/proxy/request-reset-password", { email }, {
        validateStatus: () => true,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
      } else {
        setError("No se pudo procesar la solicitud. Intenta de nuevo.");
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Correo enviado
            </h2>
            <p className="text-text-secondary">
              Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3 px-4 rounded-md bg-primary text-primary-foreground text-center font-medium hover:bg-primary/90 transition-colors"
          >
            Volver al inicio de sesión
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
              src="/images/logo.webp"
              alt="Colegio Stella Maris Rosario"
              width={80}
              height={40}
              className="w-full h-auto"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground transition-all duration-200"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Enviando...
              </div>
            ) : (
              "Enviar enlace de recuperación"
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
