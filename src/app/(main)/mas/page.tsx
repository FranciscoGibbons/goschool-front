"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Users,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  Mail,
  FileText,
  ClipboardCheck,
  CalendarDays,
  PartyPopper,
} from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import userInfoStore from "@/store/userInfoStore";
import featureFlagsStore from "@/store/featureFlagsStore";
import axios from "axios";

interface MenuItem {
  icon: typeof Clock;
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  adminOnly?: boolean;
  staffOnly?: boolean;
  featureKey?: string;
}

function MasContent() {
  const { userInfo } = userInfoStore();
  const { fetchFlags, isEnabled } = featureFlagsStore();

  useEffect(() => {
    if (userInfo) {
      fetchFlags();
    }
  }, [userInfo, fetchFlags]);
  const role = userInfo?.role;
  const isAdmin = role === "admin";
  const isStaff = role === "admin" || role === "teacher" || role === "preceptor";

  const handleLogout = async () => {
    try {
      await axios.post(`/api/proxy/logout`, {}, { withCredentials: true });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
    }
  };

  const menuSections: { title?: string; items: MenuItem[] }[] = [
    {
      title: "Academico",
      items: [
        { icon: CalendarDays, label: "Agenda", href: "/agenda", featureKey: "events" },
        { icon: PartyPopper, label: "Eventos", href: "/eventos", featureKey: "events" },
        { icon: Clock, label: "Horario", href: "/horario", featureKey: "timetables" },
        { icon: BookOpen, label: "Asignaturas", href: "/asignaturas", featureKey: "subject_messages" },
        { icon: GraduationCap, label: "Evaluaciones", href: "/examenes", featureKey: "assessments" },
        ...(isStaff
          ? [
              { icon: FileText, label: "Calificaciones", href: "/calificaciones", featureKey: "grades" },
              { icon: ClipboardCheck, label: "Asistencia", href: "/asistencia", featureKey: "assistance" },
            ]
          : []),
        { icon: Users, label: "Conducta", href: "/conducta", featureKey: "disciplinary_sanctions" },
      ],
    },
    {
      title: "Comunicacion",
      items: [
        { icon: Mail, label: "Mensajes", href: "/mensajes", featureKey: "messages" },
        { icon: MessageCircle, label: "Chat", href: "/chat", featureKey: "chat" },
      ],
    },
    {
      title: "Cuenta",
      items: [
        { icon: User, label: "Mi Perfil", href: "/perfil" },
        ...(isAdmin
          ? [{ icon: Settings, label: "Administracion", href: "/admin", adminOnly: true as const }]
          : []),
        {
          icon: LogOut,
          label: "Cerrar Sesion",
          onClick: handleLogout,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mas</h1>
      </div>

      {menuSections.map((section, sectionIdx) => {
        const visibleItems = section.items.filter(
          (item) => !item.featureKey || isEnabled(item.featureKey)
        );
        if (visibleItems.length === 0) return null;
        return (
        <div key={sectionIdx}>
          {section.title && (
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-1 mb-2">
              {section.title}
            </p>
          )}
          <div className="sacred-card !p-0 overflow-hidden divide-y divide-border">
            {visibleItems.map((item, itemIdx) => {
              const content = (
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-5 w-5 ${
                        item.destructive ? "text-error" : "text-text-secondary"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        item.destructive ? "text-error" : "text-text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {!item.destructive && (
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  )}
                </div>
              );

              if (item.onClick) {
                return (
                  <button
                    key={itemIdx}
                    onClick={item.onClick}
                    className="w-full text-left hover:bg-surface-muted transition-colors"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={itemIdx}
                  href={item.href || "#"}
                  className="block hover:bg-surface-muted transition-colors"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
        );
      })}
    </div>
  );
}

export default function MasPage() {
  return (
    <ProtectedPage>
      <MasContent />
    </ProtectedPage>
  );
}
