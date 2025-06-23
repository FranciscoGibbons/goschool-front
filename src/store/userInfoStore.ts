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
        set({ isLoading: true, error: null });
        try {
          const personalDataPromise = axios.get(
            "http://localhost:8080/api/v1/personal_data/",
            {
              withCredentials: true,
            }
          );

          const rolePromise = axios.get("http://localhost:8080/api/v1/role/", {
            withCredentials: true,
          });

          const [personalDataRes, roleRes] = await Promise.all([
            personalDataPromise,
            rolePromise,
          ]);

          const personalData = personalDataRes.data;
          const role = roleRes.data;

          set({
            userInfo: { ...personalData, role },
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
