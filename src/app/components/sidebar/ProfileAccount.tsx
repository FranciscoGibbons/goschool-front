"use client";

import { useEffect } from "react";
import Link from "next/link";
import userInfoStore from "@/store/userInfoStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/theme-toggle";
import axios from "axios";


export default function ProfileAccount() {
  const { userInfo, fetchUserInfo, refreshUserInfo, isLoading, error } = userInfoStore();

  // Debug: mostrar la foto actual
  console.log("🖼️ ProfileAccount - userInfo.photo:", userInfo?.photo);

  useEffect(() => {
    if (!userInfo || !userInfo.role) {
      fetchUserInfo();
    }
  }, [userInfo, fetchUserInfo]);

  // Función para forzar recarga de datos
  const forceRefresh = async () => {
    console.log("🔄 Forzando recarga completa de datos de usuario...");
    await refreshUserInfo();
  };

  const handleLogout = async () => {
    try {
      await axios.post(`/api/proxy/logout`, {}, {
        withCredentials: true,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error de red al cerrar sesión:", error);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const roleDisplay = (role: string) => {
    const roleColors: { [key: string]: string } = {
      student:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      teacher:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      admin: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      preceptor:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      father:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          roleColors[role] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    // Placeholder mientras carga la información
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
        <div className="flex flex-col gap-1">
          <div className="h-4 w-32 bg-muted rounded"></div>
          <div className="h-3 w-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-xs">!</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm text-red-600">Error al cargar</div>
          <button
            onClick={fetchUserInfo}
            className="text-xs text-blue-600 hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!userInfo || !userInfo.role) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-600 text-xs">?</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-600">No hay datos</div>
          <button
            onClick={fetchUserInfo}
            className="text-xs text-blue-600 hover:underline"
          >
            Cargar datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left outline-none">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={userInfo.photo || ""}
            alt={
              userInfo.name && userInfo.last_name
                ? `${userInfo.name} ${userInfo.last_name}`
                : userInfo.full_name || "Usuario"
            }
            onError={(e) => console.error("🖼️ Error cargando imagen:", userInfo.photo, e)}
            onLoad={() => console.log("✅ Imagen cargada correctamente:", userInfo.photo)}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {getInitials(
              userInfo.name && userInfo.last_name
                ? `${userInfo.name} ${userInfo.last_name}`
                : userInfo.full_name || "Usuario"
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {userInfo.name && userInfo.last_name
              ? `${userInfo.name} ${userInfo.last_name}`
              : userInfo.full_name || "Usuario"}
          </p>
          {roleDisplay(userInfo.role)}
        </div>
        <ChevronDownIcon className="h-4 w-4 text-sidebar-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem asChild>
          <Link
            href="/perfil"
            className="flex items-center gap-2 cursor-pointer"
          >
            <UserCircleIcon className="h-5 w-5" />
            <span>Mi Cuenta</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
          <div className="flex items-center justify-between w-full px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span>Tema</span>
            </div>
            <ThemeToggle />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={forceRefresh}
          className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600"
        >
          <span>🔄 Recargar Foto</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
