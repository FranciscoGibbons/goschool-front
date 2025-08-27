// src/store/userInfoStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { UserInfo } from "@/utils/types";



interface UserInfoState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

interface UserInfoActions {
  fetchUserInfo: () => Promise<void>;
  clearUserInfo: () => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<boolean>;
}

type UserInfoStore = UserInfoState & UserInfoActions;

export const useUserSelector = <T>(selector: (state: UserInfoStore) => T) =>
  userInfoStore(selector);

const userInfoStore = create<UserInfoStore>()(
  persist(
    (set) => ({
      userInfo: null,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        try {
          console.log('🔄 Iniciando verificación de autenticación...');
          
          // Hacer la petición al endpoint de verificación
          const response = await axios.get(`/api/proxy/verify-token/`, { 
            withCredentials: true,
            validateStatus: () => true // Aceptar todos los códigos de estado
          });
          
          // Log detallado de la respuesta
          console.log('📨 Respuesta de verify-token:', {
            status: response.status,
            data: response.data,
            success: response.data?.success,
            error: response.data?.error
          });
          
          // Verificar si la autenticación fue exitosa
          const isAuthenticated = response.status === 200 && response.data?.success === true;
          
          if (isAuthenticated) {
            console.log('✅ Usuario autenticado correctamente');
          } else if (response.status === 401) {
            console.log('🔒 No autorizado - Token inválido o expirado');
          } else if (response.data?.error) {
            console.error('❌ Error en la autenticación:', response.data.error);
          } else {
            console.error('❌ Error desconocido en la autenticación');
          }
          
          return isAuthenticated;
        } catch (error) {
          console.error("Error verificando autenticación:", error);
          return false;
        }
      },

      fetchUserInfo: async () => {
        // Prevent multiple simultaneous calls
        const currentState = userInfoStore.getState();
        if (currentState.isLoading) {
          console.log("🔄 fetchUserInfo already in progress, skipping...");
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          console.log("🔍 Intentando obtener datos personales...");
          console.log("🌐 URL:", `/api/proxy/personal-data/`);
          
          const [personalData, role, profilePictureRes] = await Promise.all([
            axios.get(`/api/proxy/personal-data/`, { withCredentials: true })
              .catch(err => {
                if (err.response?.status === 401) throw new Error("No autenticado");
                throw err;
              }),
            axios.get(`/api/proxy/role/`, { withCredentials: true }),
            axios.get(`/api/proxy/profile-pictures/`, { withCredentials: true })
              .catch(() => ({ data: { url: null } }))
          ]);

          const profilePicture = profilePictureRes.data?.url || null;
          const processedData = { ...personalData.data };

          // Si la API devuelve full_name, dividirlo en name y last_name
          if (personalData.data.full_name && !personalData.data.name && !personalData.data.last_name) {
            const nameParts = personalData.data.full_name.split(" ");
            processedData.name = nameParts[0] || "";
            processedData.last_name = nameParts.slice(1).join(" ") || "";
          }

          const userInfo = { 
            ...processedData, 
            role: role.data, 
            photo: profilePicture 
          };

          set({ userInfo, isLoading: false });
          return userInfo;
        } catch (error: unknown) {
          console.error("Error al obtener user info:", error);
          // Limpiar datos de usuario en caso de error de autenticación
          if (error instanceof Error && error.message === "No autenticado") {
            set({ userInfo: null, isLoading: false });
          } else {
            const message = error instanceof Error ? error.message : "Error desconocido";
            set({ error: message, isLoading: false });
          }
          throw error;
        }
      },

      clearUserInfo: () => set({ userInfo: null }),
      setError: (error) => set({ error }),
    }),
    {
      name: "user-info-storage",
      partialize: (state) => ({ userInfo: state.userInfo }),
    }
  )
);

export default userInfoStore;
