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
          className="block text-sm font-medium text-gray-700"
        >
          Correo electrónico
        </label>
        <input
          type="text"
          id="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
          placeholder="Ingresa tu correo electrónico"
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Contraseña
        </label>
        <input
          type="text"
          id="password"
          value={formData.password}
          onChange={handleInputChange("password")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
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
          className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
          disabled={isLoading}
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-700"
        >
          Recordarme
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full py-2 px-4 rounded-md text-white bg-blue-900 hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        <p className="text-sm text-gray-600 mb-2">
          Selecciona tu rol para continuar:
        </p>
        <p className="text-xs text-gray-500">{formData.email}</p>
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={resetForm}
          disabled={isLoading}
          className="flex-1 py-2 px-4 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-70"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={isLoading || !role}
          className="flex-1 py-2 px-4 rounded-md text-white bg-blue-900 hover:bg-blue-800 transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorLogin && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errorLogin}</p>
        </div>
      )}

      {roles.length === 0 ? renderLoginForm() : renderRoleSelector()}
    </form>
  );
}
