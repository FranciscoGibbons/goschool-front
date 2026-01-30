"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddActionHandler } from "./AddActionHandler";
import { Role } from "@/utils/types";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  MessageCircle,
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

  const getQuickActions = () => {
    switch (role) {
      case "admin":
        return [
          { icon: Settings, title: "Administración", description: "Panel de administración del sistema", href: "/admin" },
          { icon: BookOpen, title: "Asignaturas", description: "Gestionar materias", href: "/asignaturas" },
          { icon: MessageSquare, title: "Mensajes", description: "Ver comunicaciones", href: "/mensajes" },
          { icon: MessageCircle, title: "Chat", description: "Conversaciones en tiempo real", href: "/chat" },
          { icon: Calendar, title: "Horarios", description: "Ver horarios", href: "/horario" },
        ];
      case "preceptor":
        return [
          { icon: UserCheck, title: "Asistencias", description: "Gestionar asistencias", href: "/asistencia" },
          { icon: MessageSquare, title: "Mensajes", description: "Ver comunicaciones", href: "/mensajes" },
          { icon: MessageCircle, title: "Chat", description: "Conversaciones en tiempo real", href: "/chat" },
          { icon: Calendar, title: "Horarios", description: "Ver horarios", href: "/horario" },
        ];
      case "teacher":
        return [
          { icon: BookOpen, title: "Asignaturas", description: "Ver mis materias", href: "/asignaturas" },
          { icon: ClipboardCheck, title: "Calificaciones", description: "Cargar notas", href: "/calificaciones" },
          { icon: MessageSquare, title: "Mensajes", description: "Ver comunicaciones", href: "/mensajes" },
          { icon: MessageCircle, title: "Chat", description: "Conversaciones en tiempo real", href: "/chat" },
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();
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

      {/* Admin Panel Button */}
      {role === "admin" && (
        <button
          onClick={() => router.push("/admin")}
          className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 hover:from-primary/15 hover:to-primary/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-text-primary">Panel de Administración</p>
                <p className="text-sm text-text-secondary">Gestionar usuarios, cursos, materias y ciclos lectivos</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </button>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Acciones rapidas</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full sacred-card-interactive text-left"
                onClick={() => router.push(action.href)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-text-secondary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">{action.title}</p>
                      <p className="text-xs text-text-secondary">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-secondary" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Proximos eventos</h3>
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-sm text-text-secondary">No hay eventos programados</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6 z-50">
        <AddActionHandler role={role} />
      </div>
    </div>
  );

};

export default DashAdminPreceptorTeacher;
