// src/store/userInfoStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import { UserInfo } from "@/utils/types";

interface UserInfoState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  lastCheck: number | null;
}

interface UserInfoActions {
  fetchUserInfo: () => Promise<UserInfo | null>;
  clearUserInfo: () => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<boolean>;
  updateUserInfo: (updates: Partial<UserInfo>) => void;
  refreshUserInfo: () => Promise<void>;
}

type UserInfoStore = UserInfoState & UserInfoActions;

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

const userInfoStore = create<UserInfoStore>()(
  devtools(
    persist(
      (set, get) => ({
        userInfo: null,
        isLoading: false,
        error: null,
        lastCheck: null,

        checkAuth: async (): Promise<boolean> => {
          const state = get();
          
          // Use cached result if recent
          if (state.lastCheck && Date.now() - state.lastCheck < CACHE_DURATION && state.userInfo) {
            return true;
          }

          try {
            console.log('🔄 Verificando autenticación...');
            
            const response = await axios.get(`/api/proxy/verify-token/`, { 
              withCredentials: true,
              timeout: 10000, // 10 second timeout
              validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
            });
            
            const isAuthenticated = response.status === 200 && response.data?.success === true;
            
            if (isAuthenticated) {
              set({ lastCheck: Date.now(), error: null });
              console.log('✅ Usuario autenticado correctamente');
              
              // Fetch user info if not available or stale
              if (!state.userInfo || Date.now() - (state.lastCheck || 0) > CACHE_DURATION) {
                get().fetchUserInfo().catch(console.error);
              }
            } else {
              console.log('🔒 Autenticación fallida');
              set({ userInfo: null, lastCheck: null, error: 'Authentication failed' });
            }
            
            return isAuthenticated;
          } catch (error) {
            console.error("Error verificando autenticación:", error);
            
            if (error instanceof AxiosError) {
              if (error.response?.status === 401) {
                set({ userInfo: null, lastCheck: null, error: 'Unauthorized' });
              } else if (error.code === 'ECONNABORTED') {
                set({ error: 'Request timeout' });
              }
            }
            
            return false;
          }
        },

        fetchUserInfo: async (): Promise<UserInfo | null> => {
          const currentState = get();
          
          // Prevent multiple simultaneous calls
          if (currentState.isLoading) {
            console.log("🔄 fetchUserInfo ya en progreso...");
            return currentState.userInfo;
          }
          
          set({ isLoading: true, error: null });
          
          try {
            console.log("🔍 Obteniendo datos del usuario...");
            
            const [personalDataRes, roleRes, profilePictureRes] = await Promise.allSettled([
              axios.get(`/api/proxy/personal-data/`, { 
                withCredentials: true,
                timeout: 10000 
              }),
              axios.get(`/api/proxy/role/`, { 
                withCredentials: true,
                timeout: 10000 
              }),
              axios.get(`/api/proxy/profile-pictures/`, { 
                withCredentials: true,
                timeout: 10000 
              })
            ]);

            // Handle personal data
            if (personalDataRes.status === 'rejected') {
              if (personalDataRes.reason?.response?.status === 401) {
                throw new Error("No autenticado");
              }
              throw personalDataRes.reason;
            }

            // Handle role data
            if (roleRes.status === 'rejected') {
              console.warn("No se pudo obtener el rol del usuario:", roleRes.reason);
            }

            // Handle profile picture (optional)
            let profilePicture = null;
            if (profilePictureRes.status === 'fulfilled') {
              profilePicture = profilePictureRes.value.data?.url || `/api/profile-picture`;
            } else {
              profilePicture = `/api/profile-picture`;
            }

            const personalData = personalDataRes.value.data;
            const role = roleRes.status === 'fulfilled' ? roleRes.value.data : null;

            // Process name data
            const processedData = { ...personalData };
            if (personalData.full_name && !personalData.name && !personalData.last_name) {
              const nameParts = personalData.full_name.split(" ");
              processedData.name = nameParts[0] || "";
              processedData.last_name = nameParts.slice(1).join(" ") || "";
            }

            const userInfo: UserInfo = { 
              ...processedData, 
              role, 
              photo: profilePicture 
            };

            set({ 
              userInfo, 
              isLoading: false, 
              lastCheck: Date.now(),
              error: null 
            });

            console.log("✅ Datos del usuario obtenidos exitosamente");
            return userInfo;
          } catch (error: unknown) {
            console.error("Error al obtener user info:", error);
            
            let errorMessage = "Error desconocido";
            if (error instanceof Error) {
              errorMessage = error.message;
              if (errorMessage === "No autenticado") {
                set({ userInfo: null, lastCheck: null });
              }
            }
            
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        updateUserInfo: (updates: Partial<UserInfo>) => {
          set(state => ({
            userInfo: state.userInfo ? { ...state.userInfo, ...updates } : null
          }));
        },

        refreshUserInfo: async () => {
          set({ lastCheck: null }); // Clear cache
          await get().fetchUserInfo();
        },

        clearUserInfo: () => {
          set({ 
            userInfo: null, 
            lastCheck: null, 
            error: null, 
            isLoading: false 
          });
        },

        setError: (error: string | null) => set({ error }),
      }),
      {
        name: "user-info-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          userInfo: state.userInfo,
          lastCheck: state.lastCheck 
        }),
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          if (version === 0) {
            // Clear old cache on migration
            const state = persistedState as { userInfo?: UserInfo | null };
            return { 
              userInfo: state.userInfo || null,
              lastCheck: null 
            };
          }
          return persistedState;
        },
      }
    ),
    { name: "user-info-store" }
  )
);

// Selector hook for performance optimization
export const useUserSelector = <T>(selector: (state: UserInfoStore) => T) =>
  userInfoStore(selector);

// Specific selectors for common use cases
export const useUserInfo = () => useUserSelector(state => state.userInfo);
export const useUserRole = () => useUserSelector(state => state.userInfo?.role);
export const useIsLoading = () => useUserSelector(state => state.isLoading);
export const useAuthError = () => useUserSelector(state => state.error);

export default userInfoStore;
