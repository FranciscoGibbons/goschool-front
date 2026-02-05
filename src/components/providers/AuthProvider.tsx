"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password", "/request-reset-password", "/roles", "/superadmin-login", "/superadmin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const interceptorId = useRef<number | null>(null);
  const hasRedirected = useRef(false);

  const isPublicRoute = useCallback((path: string) => {
    return path === "/" || PUBLIC_ROUTES.some(route => path.startsWith(route));
  }, []);

  const redirectToLogin = useCallback((showToast = true) => {
    if (hasRedirected.current) return;

    const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
    if (!isPublicRoute(currentPath)) {
      hasRedirected.current = true;
      if (showToast) {
        toast.error("Sesion expirada", {
          description: "Por favor, inicia sesion nuevamente",
        });
      }
      const loginUrl = currentPath && currentPath !== "/login"
        ? `/login?from=${encodeURIComponent(currentPath)}`
        : "/login";
      router.replace(loginUrl);
      // Reset after navigation
      setTimeout(() => {
        hasRedirected.current = false;
      }, 1000);
    }
  }, [router, pathname, isPublicRoute]);

  useEffect(() => {
    // Set up axios response interceptor
    interceptorId.current = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          redirectToLogin(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      if (interceptorId.current !== null) {
        axios.interceptors.response.eject(interceptorId.current);
      }
    };
  }, [redirectToLogin]);

  // Initial session check on mount (for protected routes)
  useEffect(() => {
    const checkSession = async () => {
      if (isPublicRoute(pathname)) {
        return;
      }

      try {
        await axios.get("/api/proxy/verify-token", { withCredentials: true });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          redirectToLogin(false); // Don't show toast on initial load
        }
      }
    };

    checkSession();
  }, [pathname, isPublicRoute, redirectToLogin]);

  return <>{children}</>;
}
