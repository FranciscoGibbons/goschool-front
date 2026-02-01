"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/utils/types";
import {
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  ArrowRight,
  School,
  FileText,
  Settings,
} from "lucide-react";
import { LoadingSpinner, PageHeader, Card, CardContent } from "@/components/sacred";

import axios from "axios";

type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

interface DashboardStats {
  students?: number;
  courses?: number;
  subjects?: number;
  messages?: number;
  assessments?: number;
  grades?: number;
}

const DashAdminPreceptorTeacher = ({ role }: { role: ActionableRole }) => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const promises = [];

        if (role === "admin" || role === "preceptor") {
          promises.push(
            axios.get("/api/proxy/courses/", { withCredentials: true }),
            axios.get("/api/proxy/messages/", { withCredentials: true })
          );
        }

        if (role === "teacher" || role === "admin") {
          promises.push(
            axios.get("/api/proxy/assessments/", { withCredentials: true }),
            axios.get("/api/proxy/subjects/", { withCredentials: true })
          );
        }

        const results = await Promise.allSettled(promises);

        const newStats: DashboardStats = {};
        let resultIndex = 0;

        if (role === "admin" || role === "preceptor") {
          const coursesResult = results[resultIndex++];
          const messagesResult = results[resultIndex++];

          if (coursesResult.status === "fulfilled") {
            newStats.courses = coursesResult.value.data.length;
          }
          if (messagesResult.status === "fulfilled") {
            newStats.messages = messagesResult.value.data.length;
          }
        }

        if (role === "teacher" || role === "admin") {
          const assessmentsResult = results[resultIndex++];
          const subjectsResult = results[resultIndex++];

          if (assessmentsResult.status === "fulfilled") {
            newStats.assessments = assessmentsResult.value.data.length;
          }
          if (subjectsResult.status === "fulfilled") {
            newStats.subjects = subjectsResult.value.data.length;
          }
        }

        setStats(newStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  const getStatsCards = () => {
    const cards = [];

    if (role === "admin" || role === "preceptor") {
      if (stats.courses !== undefined) {
        cards.push({ icon: School, title: "Cursos", value: stats.courses });
      }
      if (stats.messages !== undefined) {
        cards.push({ icon: MessageSquare, title: "Mensajes", value: stats.messages });
      }
    }

    if (role === "teacher" || role === "admin") {
      if (stats.subjects !== undefined) {
        cards.push({ icon: BookOpen, title: "Asignaturas", value: stats.subjects });
      }
      if (stats.assessments !== undefined) {
        cards.push({ icon: FileText, title: "Evaluaciones", value: stats.assessments });
      }
    }

    return cards;
  };

  const getPrimaryActions = () => {
    switch (role) {
      case "preceptor":
        return [
          { icon: UserCheck, title: "Tomar Asistencia", href: "/asistencia", primary: true },
          { icon: ClipboardCheck, title: "Registrar Conducta", href: "/conducta", primary: true },
          { icon: MessageSquare, title: "Nuevo Mensaje", href: "/mensajes", primary: false },
        ];
      case "teacher":
        return [
          { icon: FileText, title: "Cargar Notas", href: "/calificaciones", primary: true },
          { icon: BookOpen, title: "Ver Entregas", href: "/entregas", primary: true },
          { icon: MessageSquare, title: "Nuevo Mensaje", href: "/mensajes", primary: false },
        ];
      case "admin":
        return [
          { icon: Settings, title: "Panel Admin", href: "/admin", primary: true },
          { icon: MessageSquare, title: "Nuevo Mensaje", href: "/mensajes", primary: true },
          { icon: FileText, title: "Calificaciones", href: "/calificaciones", primary: false },
        ];
      default:
        return [];
    }
  };

  const primaryActions = getPrimaryActions();
  const statsCards = getStatsCards();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={
          role === "admin"
            ? "Panel de administracion"
            : role === "preceptor"
            ? "Panel de preceptoria"
            : "Panel del docente"
        }
      />

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {primaryActions.map((action, index) => (
          <button
            key={index}
            onClick={() => router.push(action.href)}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
              action.primary
                ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                : "bg-surface border-border hover:bg-surface-muted"
            }`}
          >
            <div className={`p-3 rounded-lg ${
              action.primary ? "bg-primary/10" : "bg-surface-muted"
            }`}>
              <action.icon className={`h-5 w-5 ${
                action.primary ? "text-primary" : "text-text-secondary"
              }`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                action.primary ? "text-primary" : "text-text-primary"
              }`}>
                {action.title}
              </p>
            </div>
            <ArrowRight className={`h-4 w-4 ${
              action.primary ? "text-primary" : "text-text-muted"
            }`} />
          </button>
        ))}
      </div>

      {/* Stats */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary">{card.title}</p>
                  <p className="text-2xl font-semibold mt-1 text-text-primary">{card.value}</p>
                </div>
                <card.icon className="h-5 w-5 text-text-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-secondary">Acceso rapido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Horarios", href: "/horario" },
            { label: "Asignaturas", href: "/asignaturas" },
            { label: "Chat", href: "/chat" },
            { label: "Evaluaciones", href: "/examenes" },
          ].map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className="sacred-card-interactive text-center py-3"
            >
              <span className="text-sm font-medium text-text-primary">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashAdminPreceptorTeacher;
