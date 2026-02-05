"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoginForm } from "@/hooks/useLoginForm";
import Link from "next/link";
import { useState } from "react";

// Role labels for display
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  teacher: "Docente",
  student: "Estudiante",
  preceptor: "Preceptor",
  father: "Padre/Tutor",
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

interface LoginFormProps {
  primaryColor?: string | null;
}

export default function LoginForm({ primaryColor }: LoginFormProps) {
  const {
    formData,
    role,
    rememberMe,
    errorLogin,
    isLoading,
    roles,
    isFormValid,
    handleInputChange,
    handleRoleChange,
    handleRememberMeChange,
    handleSubmit,
    resetForm,
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);

  const renderLoginForm = () => (
    <>
      {/* Email field */}
      <div className="login-field-group">
        <label
          htmlFor="email"
          className="login-label"
        >
          Correo electronico
        </label>
        <div className="relative">
          <div className="login-input-icon-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <input
            type="text"
            id="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className="login-input login-input-with-icon"
            placeholder="nombre@ejemplo.com"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="login-field-group">
        <label
          htmlFor="password"
          className="login-label"
        >
          Contrasena
        </label>
        <div className="relative">
          <div className="login-input-icon-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className="login-input login-input-with-icon login-input-with-icon-right"
            placeholder="Ingresa tu contrasena"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="login-input-icon-right-btn"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => handleRememberMeChange(e.target.checked)}
            className="login-checkbox"
            disabled={isLoading}
          />
          <span className="text-sm text-text-secondary group-hover:text-foreground transition-colors">
            Recordarme
          </span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          ¿Olvidaste tu contrasena?
        </Link>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="login-button-primary w-full"
        style={primaryColor ? { backgroundColor: primaryColor } : undefined}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2.5">
            <div className="login-spinner" />
            Verificando...
          </div>
        ) : (
          "Iniciar sesion"
        )}
      </button>
    </>
  );

  const renderRoleSelector = () => (
    <div className="space-y-5">
      <div className="text-center py-2">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Selecciona tu rol
        </p>
        <p className="text-xs text-text-muted">{formData.email}</p>
      </div>

      <Select onValueChange={handleRoleChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Elige un rol" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r] || r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={resetForm}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-lg text-foreground bg-secondary hover:bg-secondary/80 focus:bg-secondary/80 active:bg-secondary/70 transition-all duration-200 disabled:opacity-50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={isLoading || !role}
          className="login-button-primary flex-1"
          style={primaryColor ? { backgroundColor: primaryColor } : undefined}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="login-spinner" />
              Procesando...
            </div>
          ) : (
            "Confirmar e ingresar"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 login-form">
      {errorLogin && (
        <div className="login-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <p className="text-sm font-medium">{errorLogin}</p>
        </div>
      )}

      {roles.length === 0 ? renderLoginForm() : renderRoleSelector()}
    </form>
  );
}
