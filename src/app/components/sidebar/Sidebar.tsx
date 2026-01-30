"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Mail,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  Clock,
  ClipboardCheck,
  X,
  Settings,
} from "lucide-react";
import ProfileAccount from "./ProfileAccount";
import ChildSelector from "./ChildSelector";
import { cn } from "@/lib/utils";
import { Button } from "@/components/sacred";
import userInfoStore from "@/store/userInfoStore";


const menuItems = [
  { name: "Inicio", icon: Home, href: "/dashboard" },
  { name: "Mensajes", icon: Mail, href: "/mensajes" },
  { name: "Asignaturas", icon: BookOpen, href: "/asignaturas" },
  { name: "Evaluaciones", icon: GraduationCap, href: "/examenes" },
  { name: "Calificaciones", icon: FileText, href: "/calificaciones" },
  { name: "Conducta", icon: Users, href: "/conducta" },
  { name: "Horario", icon: Clock, href: "/horario" },
  { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia" },
];

const adminMenuItems = [
  { name: "Administración", icon: Settings, href: "/admin" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { userInfo } = userInfoStore();
  const isAdmin = userInfo?.role === "admin";

  const closeSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebar-overlay");
      if (sidebar && overlay) {
        sidebar.classList.remove("translate-x-0");
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
      }
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-full bg-sidebar border-r border-sidebar-border",

        className
      )}
      aria-label="Menu principal"
    >
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="w-24">
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={96}
              height={48}
              className="w-full h-auto"
              priority
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:block px-4 py-4 border-b border-border">
          <Link href="/dashboard" className="block w-24">
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={96}
              height={48}
              className="w-full h-auto"
              priority
            />
          </Link>
        </div>

        <div className="px-3 py-3">
          <ChildSelector />
        </div>

        <nav className="flex-1 px-2" role="navigation">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive
                          ? "text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70"

                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <li className="pt-4 pb-1">
                  <span className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    Administración
                  </span>
                </li>
                {adminMenuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isActive
                              ? "text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70"
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <ProfileAccount />
      </div>
    </aside>
  );
}
