"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginForm() {
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

  // Renderizado condicional optimizado
  const renderLoginForm = () => (
    <>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Correo electrónico
        </label>
        <input
          type="text"
          id="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground transition-all duration-200"
          placeholder="Ingresa tu correo electrónico"
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleInputChange("password")}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground transition-all duration-200"
          placeholder="Ingresa tu contraseña"
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => handleRememberMeChange(e.target.checked)}
          className="h-4 w-4 text-primary border-input rounded focus:ring-primary bg-background"
          disabled={isLoading}
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-foreground"
        >
          Recordarme
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full py-3 px-4 rounded-md login-button-primary transition-all duration-300 cursor-pointer"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            Procesando...
          </div>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </>
  );

  const renderRoleSelector = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Selecciona tu rol para continuar:
        </p>
        <p className="text-xs text-muted-foreground">{formData.email}</p>
      </div>

      <Select onValueChange={handleRoleChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Elige un rol" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={resetForm}
          disabled={isLoading}
          className="flex-1 py-2.5 px-4 rounded-md text-foreground bg-secondary hover:bg-secondary/80 focus:bg-secondary/80 active:bg-secondary/70 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={isLoading || !role}
          className="flex-1 py-2.5 px-4 rounded-md login-button-primary transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Procesando...
            </div>
          ) : (
            "Confirmar rol e ingresar"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 login-form">
      {errorLogin && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">

          <p className="text-destructive text-sm font-medium">{errorLogin}</p>
        </div>
      )}

      {roles.length === 0 ? renderLoginForm() : renderRoleSelector()}
    </form>
  );
}
