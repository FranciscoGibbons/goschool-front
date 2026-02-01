"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  ClipboardCheck,
  Mail,
  MoreHorizontal,
  BookOpen,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import userInfoStore from "@/store/userInfoStore";

interface TabItem {
  name: string;
  icon: typeof Home;
  href: string;
}

const staffTabs: TabItem[] = [
  { name: "Inicio", icon: Home, href: "/dashboard" },
  { name: "Notas", icon: FileText, href: "/calificaciones" },
  { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia" },
  { name: "Mensajes", icon: Mail, href: "/mensajes" },
  { name: "Mas", icon: MoreHorizontal, href: "/mas" },
];

const adminTabs: TabItem[] = [
  { name: "Inicio", icon: Home, href: "/admin" },
  { name: "Notas", icon: FileText, href: "/calificaciones" },
  { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia" },
  { name: "Mensajes", icon: Mail, href: "/mensajes" },
  { name: "Mas", icon: MoreHorizontal, href: "/mas" },
];

const studentTabs: TabItem[] = [
  { name: "Inicio", icon: Home, href: "/dashboard" },
  { name: "Notas", icon: FileText, href: "/calificaciones" },
  { name: "Tareas", icon: BookOpen, href: "/entregas" },
  { name: "Horario", icon: Clock, href: "/horario" },
  { name: "Mas", icon: MoreHorizontal, href: "/mas" },
];

export default function MobileBottomTabs() {
  const pathname = usePathname();
  const { userInfo } = userInfoStore();

  const role = userInfo?.role;
  const tabs =
    role === "student" || role === "father"
      ? studentTabs
      : role === "admin"
      ? adminTabs
      : staffTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-text-secondary active:text-text-primary"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-text-secondary"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
