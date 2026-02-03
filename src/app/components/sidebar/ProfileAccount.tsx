"use client";

import { useEffect } from "react";
import Link from "next/link";
import userInfoStore from "@/store/userInfoStore";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Badge,
} from "@/components/sacred";

import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

export default function ProfileAccount() {
  const { userInfo, fetchUserInfo, isLoading, error } = userInfoStore();



  useEffect(() => {
    if (!userInfo || !userInfo.role) {
      fetchUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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
    const roleVariants: { [key: string]: "success" | "info" | "error" | "warning" | "neutral" } = {
      student: "success",
      teacher: "info",
      admin: "error",
      preceptor: "warning",
      father: "neutral",
    };
    return (
      <Badge variant={roleVariants[role] || "neutral"}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-sidebar-accent"></div>
        <div className="flex flex-col gap-1">
          <div className="h-4 w-32 bg-sidebar-accent rounded"></div>
          <div className="h-3 w-20 bg-sidebar-accent rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-error/20 flex items-center justify-center">
          <span className="text-error text-xs">!</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm text-error">Error al cargar</div>
          <button
            onClick={fetchUserInfo}
            className="text-xs text-sidebar-primary hover:underline"
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
        <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
          <span className="text-sidebar-foreground text-xs">?</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm text-sidebar-foreground">No hay datos</div>
          <button
            onClick={fetchUserInfo}
            className="text-xs text-sidebar-primary hover:underline"
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

          />
          <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary font-bold">
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
        <ChevronDownIcon className="h-4 w-4 text-sidebar-foreground/70" />
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

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-error focus:text-error focus:bg-error-muted"
        >

          <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
