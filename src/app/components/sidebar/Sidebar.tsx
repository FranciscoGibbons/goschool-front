"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Mail,
  MessageCircle,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  Clock,
  ClipboardCheck,
  Settings,
  BookMarked,
  CalendarClock,
} from "lucide-react";
import ProfileAccount from "./ProfileAccount";
import ChildSelector from "./ChildSelector";
import { cn } from "@/lib/utils";
import userInfoStore from "@/store/userInfoStore";

const menuItems = [
  { name: "Mensajes", icon: Mail, href: "/mensajes" },
  { name: "Chat", icon: MessageCircle, href: "/chat" },
  { name: "Asignaturas", icon: BookOpen, href: "/asignaturas" },
  { name: "Evaluaciones", icon: GraduationCap, href: "/examenes" },
  { name: "Calificaciones", icon: FileText, href: "/calificaciones" },
  { name: "Conducta", icon: Users, href: "/conducta" },
  { name: "Horario", icon: Clock, href: "/horario" },
  { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia" },
  { name: "Observaciones", icon: BookMarked, href: "/cuaderno" },
  { name: "Reuniones", icon: CalendarClock, href: "/turnos" },
];

const adminMenuItems = [
  { name: "Administracion", icon: Settings, href: "/admin" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { userInfo } = userInfoStore();
  const isAdmin = userInfo?.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/dashboard";

  const isNavActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-full bg-sidebar border-r border-sidebar-border",
        className
      )}
      aria-label="Menu principal"
    >
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <Link href={homeHref} className="block w-24">
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
            {/* Inicio */}
            <li>
              <Link
                href={homeHref}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  isNavActive(homeHref)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Home
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isNavActive(homeHref)
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70"
                  )}
                />
                <span>Inicio</span>
              </Link>
            </li>

            {/* Admin link */}
            {isAdmin &&
              adminMenuItems.map((item) => {
                const isActive = isNavActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
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

            {/* Separator */}
            <li className="py-1.5">
              <div className="border-t border-sidebar-border mx-2" />
            </li>

            {/* All nav items */}
            {menuItems.map((item) => {
              const isActive = isNavActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
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
          </ul>
        </nav>
      </div>

      <div className="border-t border-sidebar-border">
        <ProfileAccount />
      </div>
    </aside>
  );
}
