"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddActionHandler } from "./AddActionHandler";
import userInfoStore from "@/store/userInfoStore";
import { Role } from "@/utils/types";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  ArrowRight,
  School,
  FileText,
} from "lucide-react";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  const { userInfo } = userInfoStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  const getUserDisplayName = () => {
    if (!userInfo) return "Usuario";
    
    if (userInfo.name && userInfo.last_name) {
      return `${userInfo.name} ${userInfo.last_name}`;
    }
    
    return userInfo.full_name || "Usuario";
  };

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
        cards.push({
          icon: School,
          title: "Cursos",
          value: stats.courses,
          color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
        });
      }
      if (stats.messages !== undefined) {
        cards.push({
          icon: MessageSquare,
          title: "Mensajes",
          value: stats.messages,
          color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
        });
      }
    }

    if (role === "teacher" || role === "admin") {
      if (stats.subjects !== undefined) {
        cards.push({
          icon: BookOpen,
          title: "Asignaturas",
          value: stats.subjects,
          color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20",
        });
      }
      if (stats.assessments !== undefined) {
        cards.push({
          icon: FileText,
          title: "Evaluaciones",
          value: stats.assessments,
          color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20",
        });
      }
    }

    return cards;
  };

  const getQuickActions = () => {
    switch (role) {
      case "admin":
        return [
          {
            icon: BookOpen,
            title: "Asignaturas",
            description: "Gestionar materias",
            href: "/asignaturas",
          },
          {
            icon: MessageSquare,
            title: "Mensajes",
            description: "Ver comunicaciones",
            href: "/mensajes",
          },
          {
            icon: Calendar,
            title: "Horarios",
            description: "Ver horarios académicos",
            href: "/horario",
          },
        ];
      
      case "preceptor":
        return [
          {
            icon: UserCheck,
            title: "Asistencias",
            description: "Gestionar asistencias",
            href: "/asistencia",
          },
          {
            icon: MessageSquare,
            title: "Mensajes",
            description: "Ver comunicaciones",
            href: "/mensajes",
          },
          {
            icon: Calendar,
            title: "Horarios",
            description: "Ver horarios académicos",
            href: "/horario",
          },
        ];
      
      case "teacher":
        return [
          {
            icon: BookOpen,
            title: "Asignaturas",
            description: "Ver mis materias",
            href: "/asignaturas",
          },
          {
            icon: ClipboardCheck,
            title: "Calificaciones",
            description: "Cargar notas",
            href: "/calificaciones",
          },
          {
            icon: MessageSquare,
            title: "Mensajes",
            description: "Ver comunicaciones",
            href: "/mensajes",
          },
        ];
      
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();
  const statsCards = getStatsCards();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Bienvenida, {getUserDisplayName()}. Aquí está el resumen de hoy.
          </p>
        </div>

        {/* Stats Cards Grid */}
        {statsCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <div key={index} className="stat-card group">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <card.icon className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div className="icon-wrapper">
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Acciones Rápidas</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="action-card group"
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="icon-wrapper">
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {action.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Próximos Eventos</h3>
            <div className="dashboard-card">
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-center">
                  No hay eventos próximos programados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed right-6 bottom-6 z-50 lg:bottom-22">
          <AddActionHandler role={role} />
        </div>
      </div>
    </div>
  );
};

export default DashAdminPreceptorTeacher;
