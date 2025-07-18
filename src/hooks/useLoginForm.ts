import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import userInfoStore from "@/store/userInfoStore";

interface LoginCredentials {
  email: string;
  password: string;
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

  // Validación simple: solo verificar que los campos no estén vacíos
  const isFormValid = useMemo(() => {
    return formData.email.trim() !== "" && formData.password.trim() !== "";
  }, [formData.email, formData.password]);

  // Funciones de API memoizadas
  const fetchRoles = useCallback(
    async (credentials: LoginCredentials): Promise<string[]> => {
      try {
        const res = await axios.post("/api/get-roles", credentials, {
          withCredentials: true,
        });

        if (res.status !== 200) {
          throw new Error("Error al obtener roles disponibles");
        }

        return res.data.roles || [];
      } catch (error) {
        console.error("Error fetching roles:", error);
        throw new Error("Error al obtener roles");
      }
    },
    []
  );

  const performLogin = useCallback(
    async (
      credentials: LoginCredentials,
      selectedRole: string
    ): Promise<boolean> => {
      try {
        const res = await axios.post(
          "/api/login",
          { ...credentials, role: selectedRole },
          {
            withCredentials: true,
          }
        );

        if (res.status === 200) {
          return true;
        } else {
          throw new Error("Credenciales inválidas");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw new Error("Error al iniciar sesión");
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
          // Paso 1: Obtener roles
          const userRoles = await fetchRoles(formData);

          if (userRoles.length === 0) {
            setErrorLogin("No tienes roles asignados.");
            return;
          }

          if (userRoles.length === 1) {
            // Login directo si solo hay un rol
            const loginSuccess = await performLogin(formData, userRoles[0]);

            if (loginSuccess) {
              await fetchUserInfo();
              router.push("/dashboard");
            }
          } else {
            // Mostrar selector de roles
            setRoles(userRoles);
          }
        } else {
          // Login con rol seleccionado
          if (!role) {
            setErrorLogin("Por favor, selecciona un rol.");
            return;
          }

          const loginSuccess = await performLogin(formData, role);

          if (loginSuccess) {
            await fetchUserInfo();
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrorLogin(
          error instanceof Error ? error.message : "Error de conexión."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData,
      roles,
      role,
      isFormValid,
      fetchRoles,
      performLogin,
      fetchUserInfo,
      router,
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
