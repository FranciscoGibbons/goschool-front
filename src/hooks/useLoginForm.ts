import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import userInfoStore from "@/store/userInfoStore";
import { getSafeRedirectPath } from "@/lib/security";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  selectRole?: boolean;
  roles?: string[];
}

interface UseLoginFormReturn {
  formData: LoginCredentials;
  role: string;
  rememberMe: boolean;
  errorLogin: string | null;
  isLoading: boolean;
  roles: string[];
  isFormValid: boolean;
  handleInputChange: (
    field: keyof LoginCredentials
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  handleRememberMeChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

export const useLoginForm = (): UseLoginFormReturn => {
  const { fetchUserInfo } = userInfoStore();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [role, setRole] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener la ruta de destino después del login (validada contra open redirect)
  const redirectTo = useMemo(
    () => getSafeRedirectPath(searchParams.get("from")),
    [searchParams]
  );

  // Validación del formulario
  const isFormValid = useMemo(() => {
    const emailValid = formData.email.trim() !== "";
    const passwordValid = formData.password.trim() !== "";
    return emailValid && passwordValid;
  }, [formData.email, formData.password]);

  // Perform login with credentials only
  const performLogin = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResponse> => {
      try {
        const res = await axios.post<LoginResponse>(`/api/proxy/login`, credentials, {
          withCredentials: true,
        });
        return res.data;
      } catch (error) {
        console.error("Login error:", error);
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          const data = error.response.data;
          const msg = typeof data === 'string' ? data : data?.message || data?.error || '';

          if (msg.includes("School not found") || msg.includes("Missing tenant")) {
            throw new Error("Colegio no encontrado. Verifica que la direccion sea correcta.");
          }
          if (msg.includes("School is inactive")) {
            throw new Error("Este colegio se encuentra desactivado.");
          }
          if (status === 401) {
            throw new Error("Credenciales invalidas");
          }
        }
        throw new Error("Error al iniciar sesion. Intenta de nuevo mas tarde.");
      }
    },
    []
  );

  // Select role (uses temp JWT from cookie)
  const selectRole = useCallback(
    async (selectedRole: string): Promise<boolean> => {
      try {
        await axios.post(`/api/proxy/roles`, selectedRole, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return true;
      } catch (error) {
        console.error("Role selection error:", error);
        throw new Error("Error al seleccionar rol");
      }
    },
    []
  );

  // Handlers
  const handleInputChange = useCallback(
    (field: keyof LoginCredentials) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
        if (errorLogin) {
          setErrorLogin(null);
        }
      },
    [errorLogin]
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setRole(value);
      if (errorLogin) {
        setErrorLogin(null);
      }
    },
    [errorLogin]
  );

  const handleRememberMeChange = useCallback((checked: boolean) => {
    setRememberMe(checked);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ email: "", password: "" });
    setRole("");
    setRoles([]);
    setErrorLogin(null);
  }, []);

  // Esperar cookie JWT, cargar info de usuario y redirigir
  const completeLoginAndRedirect = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchUserInfo();
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
    router.push(redirectTo);
  }, [fetchUserInfo, router, redirectTo]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        setErrorLogin("Por favor, completa todos los campos.");
        return;
      }

      setErrorLogin(null);
      setIsLoading(true);

      try {
        if (roles.length === 0) {
          // Step 1: Login with credentials
          const loginResult = await performLogin(formData);

          if (!loginResult.success) {
            setErrorLogin(loginResult.message || "Error al iniciar sesión");
            return;
          }

          if (loginResult.selectRole && loginResult.roles && loginResult.roles.length > 0) {
            setRoles(loginResult.roles);
          } else {
            await completeLoginAndRedirect();
          }
        } else {
          // Step 2: Select role (we already have temp JWT in cookie)
          if (!role) {
            setErrorLogin("Por favor, selecciona un rol.");
            return;
          }

          const success = await selectRole(role);
          if (success) {
            await completeLoginAndRedirect();
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
          setErrorLogin(error.message);
        } else {
          setErrorLogin("Error de conexión. Verifica tu conexión a internet.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData,
      roles,
      role,
      isFormValid,
      performLogin,
      selectRole,
      completeLoginAndRedirect,
    ]
  );

  return {
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
  };
};
