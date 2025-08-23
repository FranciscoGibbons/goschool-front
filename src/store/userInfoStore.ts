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

      fetchUserInfo: async () => {
        console.log("fetchUserInfo called");
        set({ isLoading: true, error: null });
        try {

          const personalDataPromise = axios.get(
            `/api/proxy/personal-data`,
            {
              withCredentials: true,
            }
          );
          
          const rolePromise = axios.get(`/api/proxy/role`, {
            withCredentials: true,
          });
          
          const profilePicturePromise = axios.get(
            `/api/proxy/profile-pictures`,
            {
              withCredentials: true,
            }
          );

          const [personalDataRes, roleRes, profilePictureRes] =
            await Promise.all([
              personalDataPromise,
              rolePromise,
              profilePicturePromise.catch(() => ({ data: null })), // Si falla, retorna null
            ]);

          const personalData = personalDataRes.data;
          const role = roleRes.data;
          // Usamos la URL directa del backend
          const profilePicture = profilePictureRes.data?.url || null;

          console.log("Personal data from API:", personalData);
          console.log("Role from API:", role);
          console.log("Profile picture from API:", profilePicture);

          // Procesar los datos para asegurar que tengan la estructura correcta
          const processedData = { ...personalData };

          // Si la API devuelve full_name, dividirlo en name y last_name
          if (
            personalData.full_name &&
            !personalData.name &&
            !personalData.last_name
          ) {
            const nameParts = personalData.full_name.split(" ");
            processedData.name = nameParts[0] || "";
            processedData.last_name = nameParts.slice(1).join(" ") || "";
          }

          set({
            userInfo: { ...processedData, role, photo: profilePicture },
            isLoading: false,
          });
        } catch (error) {
          console.error("Error al obtener user info:", error);
          const message =
            axios.isAxiosError(error) && error.response
              ? error.response.data?.message || error.message
              : "Error desconocido";

          set({ error: message, isLoading: false });
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
