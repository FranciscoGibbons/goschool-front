"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import userInfoStore from "@/store/userInfoStore";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginForm() {
  const { fetchUserInfo } = userInfoStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorLogin(null);
    setIsLoading(true);

    try {
      if (!roles.length) {
        // 1. Obtener roles
        const res = await fetch("/api/get-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          setErrorLogin("Correo o contraseña incorrectos.");
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        if (data.roles.length === 0) {
          setErrorLogin("No tienes roles asignados.");
        } else if (data.roles.length === 1) {
          // 2. Hacer login directamente
          const loginRes = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: data.roles[0] }),
          });

          if (loginRes.ok) {
            try {
              // 3. Si el login fue exitoso, traer la info del usuario y ESPERAR a que termine
              await fetchUserInfo();
              console.log("User info fetched after login");
              router.push("/dashboard");
            } catch (error) {
              console.error("Error fetching user info:", error);
              setErrorLogin(
                "Sesión iniciada pero no se pudo cargar la información del usuario."
              );
            }
          } else {
            setErrorLogin("Error al iniciar sesión.");
          }
        } else {
          setRoles(data.roles);
        }
      } else {
        // Ya tenemos roles, login con rol seleccionado
        const loginRes = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        if (loginRes.ok) {
          try {
            await fetchUserInfo();
            console.log("User info fetched after role selection");
            router.push("/dashboard");
          } catch (error) {
            console.error("Error fetching user info:", error);
            setErrorLogin(
              "Sesión iniciada pero no se pudo cargar la información del usuario."
            );
          }
        } else {
          setErrorLogin("Error al iniciar sesión.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorLogin("Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!roles.length ? (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
              placeholder="Ingresa tu correo electrónico"
              required
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
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {errorLogin && (
            <div className="text-red-500 text-sm mt-2">{errorLogin}</div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Recordarme
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md text-white bg-blue-900 hover:bg-blue-800 transition-colors disabled:opacity-70"
          >
            {isLoading ? "Procesando..." : "Iniciar sesión"}
          </button>
        </>
      ) : (
        <div>
          <p className="mb-2 text-sm text-gray-600">Selecciona tu rol:</p>
          <Select onValueChange={(value) => setRole(value)}>
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

          {errorLogin && (
            <div className="text-red-500 text-sm mt-2">{errorLogin}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !role}
            className="w-full py-2 px-4 rounded-md text-white bg-blue-900 hover:bg-blue-800 transition-colors disabled:opacity-70"
          >
            {isLoading ? "Procesando..." : "Confirmar rol e ingresar"}
          </button>
        </div>
      )}
    </form>
  );
}
