"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  EnvelopeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  PencilIcon,
  ChevronUpIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ClockIcon as ClockIconSolid,
  PencilIcon as PencilIconSolid,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/sacred";


import userInfoStore from "@/store/userInfoStore";
import axios from "axios";

const menuItems = [
  { 
    name: "Inicio", 
    icon: HomeIcon, 
    iconSolid: HomeIconSolid, 
    href: "/dashboard" 
  },
  { 
    name: "Mensajes", 
    icon: EnvelopeIcon, 
    iconSolid: EnvelopeIconSolid, 
    href: "/mensajes" 
  },
  { 
    name: "Asignaturas", 
    icon: BookOpenIcon, 
    iconSolid: BookOpenIconSolid, 
    href: "/asignaturas" 
  },
  { 
    name: "Exámenes", 
    icon: AcademicCapIcon, 
    iconSolid: AcademicCapIconSolid, 
    href: "/examenes" 
  },
  {
    name: "Calificaciones",
    icon: ClipboardDocumentListIcon,
    iconSolid: ClipboardDocumentListIconSolid,
    href: "/calificaciones",
  },
  { 
    name: "Conducta", 
    icon: UserGroupIcon, 
    iconSolid: UserGroupIconSolid, 
    href: "/conducta" 
  },
  { 
    name: "Horario", 
    icon: ClockIcon, 
    iconSolid: ClockIconSolid, 
    href: "/horario" 
  },
  { 
    name: "Asistencia", 
    icon: PencilIcon, 
    iconSolid: PencilIconSolid, 
    href: "/asistencia" 
  },
];

interface ProfileDropdownProps {
  onMouseEnter: (name: string, event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

interface TooltipProps {
  text: string;
  visible: boolean;
  position: { x: number; y: number };
}

function ProfileDropdown({ onMouseEnter, onMouseLeave }: ProfileDropdownProps) {
  const { userInfo, fetchUserInfo } = userInfoStore();

  useEffect(() => {
    if (!userInfo || !userInfo.role) {
      fetchUserInfo();
    }
  }, [userInfo, fetchUserInfo]);

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

  if (!userInfo) {
    return (
      <div className="h-10 w-10 rounded-full bg-surface-muted animate-pulse" />
    );

  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger 
          className="flex items-center justify-center p-1 rounded-full transition-all duration-200 hover:bg-surface-muted outline-none"
          onMouseEnter={(e) => onMouseEnter("Perfil", e)}
          onMouseLeave={onMouseLeave}
        >

        <Avatar className="h-8 w-8">
          <AvatarImage
            src={userInfo.photo || ""}
            alt={
              userInfo.name && userInfo.last_name
                ? `${userInfo.name} ${userInfo.last_name}`
                : userInfo.full_name || "Usuario"
            }
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {getInitials(
              userInfo.name && userInfo.last_name
                ? `${userInfo.name} ${userInfo.last_name}`
                : userInfo.full_name || "Usuario"
            )}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mb-2" align="end">
        <DropdownMenuItem asChild>
          <Link
            href="/perfil"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ChevronUpIcon className="h-5 w-5" />
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

function Tooltip({ text, visible, position }: TooltipProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x,
        bottom: position.y + 10,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-text-primary text-background px-3 py-2 rounded-md text-sm font-medium shadow-sm whitespace-nowrap">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary" />
      </div>
    </div>
  );
}

export default function BottomNavbar() {
  const pathname = usePathname();
  const [tooltip, setTooltip] = useState<TooltipProps>({
    text: '',
    visible: false,
    position: { x: 0, y: 0 }
  });

  const handleMouseEnter = (name: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text: name,
      visible: true,
      position: {
        x: rect.left + rect.width / 2,
        y: window.innerHeight - rect.top
      }
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev: TooltipProps) => ({ ...prev, visible: false }));
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border lg:block hidden">

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-1 py-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const IconComponent = isActive ? item.iconSolid : item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-full transition-all duration-200 relative group",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                  )}

                  onMouseEnter={(e) => handleMouseEnter(item.name, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <IconComponent 
                    className={cn(
                      "h-6 w-6 transition-all duration-200",
                      isActive ? "text-primary scale-110" : "text-text-secondary group-hover:scale-105"
                    )} 
                  />
                </Link>
              );
            })}
            
            {/* Profile Dropdown */}
            <div className="ml-2 pl-2 border-l border-border">
              <ProfileDropdown 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            </div>
          </div>
        </div>
      </nav>
      
      <Tooltip 
        text={tooltip.text}
        visible={tooltip.visible}
        position={tooltip.position}
      />
    </>
  );
}