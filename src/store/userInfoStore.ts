                                                                                                                                                                                                // src/store/userInfoStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import { UserInfo, Child } from "@/utils/types";
import childSelectionStore from "./childSelectionStore";

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

          console.log('🔍 checkAuth iniciado - lastCheck:', state.lastCheck, 'userInfo:', !!state.userInfo);

          // Use cached result if recent
          if (state.lastCheck && Date.now() - state.lastCheck < CACHE_DURATION && state.userInfo) {
            console.log('✅ Usando resultado cacheado');
            return true;
          }

          // NOTA: La cookie JWT es HTTP-only, no podemos verificarla desde JavaScript.
          // Hacemos la petición al proxy que verificará la cookie automáticamente.

          try {
            console.log('🔄 Verificando autenticación...');

            const response = await axios.get(`/api/proxy/verify_token/`, {
              withCredentials: true,
              timeout: 10000, // 10 second timeout
              validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
            });

            // El backend devuelve "json web token is valid" como string, no un objeto con success
            const isAuthenticated = response.status === 200;

            if (isAuthenticated) {
              set({ lastCheck: Date.now(), error: null });
              console.log('✅ Token JWT válido, usuario autenticado');

              // Fetch user info if not available or stale
              if (!state.userInfo || Date.now() - (state.lastCheck || 0) > CACHE_DURATION) {
                get().fetchUserInfo().catch(console.error);
              }
            } else {
              console.log('🔒 Token JWT inválido o expirado');
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

            // Handle role first to check if it's a father
            let userRole: string | null = null;
            if (roleRes.status === 'fulfilled') {
              userRole = roleRes.value.data;
            } else {
              console.warn("No se pudo obtener el rol del usuario:", roleRes.reason);
            }

            // Para padres, cargar también información sobre sus hijos
            interface ChildData {
              id: number;
              full_name?: string;
              photo?: string | null;
              email: string;
              course_id?: number | null;
            }
            
            let childrenData: ChildData[] = [];
            
            if (userRole === "father") {
              try {
                console.log("👨‍👩‍👧‍👦 Cargando hijos del padre...");
                const childrenResponse = await axios.get(`/api/proxy/students/`, { 
                  withCredentials: true,
                  timeout: 10000 
                });
                childrenData = childrenResponse.data || [];
                console.log("👶 Hijos cargados:", childrenData.length);
              } catch (childrenError) {
                console.warn("⚠️ Error cargando hijos:", childrenError);
                // No es crítico si falla la carga de hijos
              }
            }

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
            if (profilePictureRes.status === 'fulfilled' && profilePictureRes.value.data?.url) {
              const photoUrl = profilePictureRes.value.data.url;
              console.log("🖼️ URL original del backend:", photoUrl);
              
              // Extraer el nombre del archivo de la URL
              let fileName = photoUrl;
              
              // Si viene con estructura de path completa, extraer solo el nombre del archivo
              if (fileName.includes('/uploads/profile_pictures/')) {
                fileName = fileName.split('/uploads/profile_pictures/').pop() || fileName;
              }
              // Si viene con ./ al inicio, quitarlo
              fileName = fileName.replace(/^\.\//, '');
              // Si aún contiene path, quedarnos solo con el nombre del archivo
              fileName = fileName.split('/').pop() || fileName;
              
              // Usar el proxy interno para evitar problemas de certificados SSL
              profilePicture = `/api/image-proxy/uploads/profile_pictures/${fileName}`;
              console.log("🔧 URL con proxy:", profilePicture);
            } else {
              // Usar imagen por defecto del frontend (no necesita proxy)
              profilePicture = `/images/default.jpg`;
              console.log("📷 Usando imagen por defecto:", profilePicture);
            }
            
            console.log("🎯 URL final de la foto:", profilePicture);

            const personalData = personalDataRes.value.data;

            // Process name data
            const processedData = { ...personalData };
            if (personalData.full_name && !personalData.name && !personalData.last_name) {
              const nameParts = personalData.full_name.split(" ");
              processedData.name = nameParts[0] || "";
              processedData.last_name = nameParts.slice(1).join(" ") || "";
            }

            // Process children data for fathers
            let processedChildren: Child[] = [];
            if (userRole === "father" && childrenData.length > 0) {
              processedChildren = childrenData.map((child: ChildData) => {
                const fullName = child.full_name || `Estudiante ${child.id}`;
                const nameParts = fullName.split(" ");
                return {
                  id: child.id,
                  name: nameParts[0] || "Estudiante",
                  last_name: nameParts.slice(1).join(" ") || `${child.id}`,
                  course_id: child.course_id || 0,
                  course_name: "", // Será cargado después si es necesario
                };
              });
            }

            const userInfo: UserInfo = {
              ...processedData,
              id: processedData.user_id,
              role: userRole,
              photo: profilePicture,
              children: processedChildren,
              // Mantener name y last_name para compatibilidad con componentes existentes
              name: processedData.name,
              last_name: processedData.last_name
            };

            set({ 
              userInfo, 
              isLoading: false, 
              lastCheck: Date.now(),
              error: null 
            });

            // Initialize child selection store for fathers
            if (userRole === "father" && processedChildren.length > 0) {
              childSelectionStore.getState().setChildren(processedChildren);
            }

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
