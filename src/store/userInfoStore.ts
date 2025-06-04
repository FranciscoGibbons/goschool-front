// src/store/userInfoStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserInfo } from "@/utils/types";

// Separamos estado y acciones para mejor organización
interface UserInfoState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

interface UserInfoActions {
  fetchUserInfo: () => Promise<void>;
  clearUserInfo: () => void;
  setError: (error: string | null) => void;
}

// Combinamos estado y acciones
type UserInfoStore = UserInfoState & UserInfoActions;

// Creamos un selector para simplificar uso de propiedades específicas
export const useUserSelector = <T>(selector: (state: UserInfoStore) => T) =>
  userInfoStore(selector);

// Implementación del store con persistencia
const userInfoStore = create<UserInfoStore>()(
  persist(
    (set) => ({
      userInfo: null,
      isLoading: false,
      error: null,

      fetchUserInfo: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(
            "http://localhost:8080/api/v1/personal_data/",
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (!res.ok) {
            throw new Error("No se pudo obtener user info");
          }

          const data = await res.json();
          set({ userInfo: data, isLoading: false });
        } catch (error) {
          console.error("Error al obtener user info:", error);
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
          });
        }
      },

      clearUserInfo: () => set({ userInfo: null }),

      setError: (error) => set({ error }),
    }),
    {
      name: "user-info-storage", // Nombre para localStorage
      partialize: (state) => ({ userInfo: state.userInfo }), // Solo persistimos userInfo
    }
  )
);

export default userInfoStore;
