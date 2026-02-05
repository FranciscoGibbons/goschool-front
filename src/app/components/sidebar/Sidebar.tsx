"use client";

import { useEffect } from "react";
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
  CalendarDays,
  PartyPopper,
} from "lucide-react";
import ProfileAccount from "./ProfileAccount";
import ChildSelector from "./ChildSelector";
import NotificationBell from "@/components/NotificationBell";
import { cn } from "@/lib/utils";
import userInfoStore from "@/store/userInfoStore";
import featureFlagsStore from "@/store/featureFlagsStore";

const menuItems = [
  { name: "Mensajes", icon: Mail, href: "/mensajes", featureKey: "messages" },
  { name: "Chat", icon: MessageCircle, href: "/chat", featureKey: "chat" },
  { name: "Agenda", icon: CalendarDays, href: "/agenda", featureKey: "events" },
  { name: "Asignaturas", icon: BookOpen, href: "/asignaturas", featureKey: "subject_messages" },
  { name: "Evaluaciones", icon: GraduationCap, href: "/examenes", featureKey: "assessments" },
  { name: "Calificaciones", icon: FileText, href: "/calificaciones", featureKey: "grades" },
  { name: "Conducta", icon: Users, href: "/conducta", featureKey: "disciplinary_sanctions" },
  { name: "Horario", icon: Clock, href: "/horario", featureKey: "timetables" },
  { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia", featureKey: "assistance" },
  { name: "Observaciones", icon: BookMarked, href: "/cuaderno", featureKey: "observaciones" },
  { name: "Eventos", icon: PartyPopper, href: "/eventos", featureKey: "events" },
  { name: "Reuniones", icon: CalendarClock, href: "/turnos", featureKey: "meeting_requests" },
];

const adminMenuItems = [
  { name: "Administracion", icon: Settings, href: "/admin" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { userInfo } = userInfoStore();
  const { fetchFlags, isEnabled } = featureFlagsStore();

  useEffect(() => {
    if (userInfo) {
      fetchFlags();
    }
  }, [userInfo, fetchFlags]);

  // Superadmin has its own sidebar
  if (pathname.startsWith("/superadmin")) return null;

  const isAdmin = userInfo?.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/dashboard";

  const isNavActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-full bg-sidebar border-r border-sidebar-border overflow-visible",
        className
      )}
      aria-label="Menu principal"
    >
      {/* Logo + Notifications - Outside overflow container */}
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
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
        <NotificationBell />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
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
            {menuItems.filter((item) => isEnabled(item.featureKey)).map((item) => {
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
