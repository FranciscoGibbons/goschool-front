"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddActionHandler } from "./AddActionHandler";
import userInfoStore from "@/store/userInfoStore";
import { Role } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

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

  const getRoleLabel = (userRole: ActionableRole) => {
    const roleLabels = {
      admin: "Administrador",
      teacher: "Profesor",
      preceptor: "Preceptor"
    };
    return roleLabels[userRole];
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
    <div className="h-full flex flex-col">
      {/* Header de bienvenida */}
      <div className="mb-6">
        <h1 className="heading-1 mb-2">Panel de {getRoleLabel(role)}</h1>
        <p className="body-text text-muted-foreground">
          Bienvenido, {getUserDisplayName()}. Gestiona el sistema académico desde aquí.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, index) => (
            <Card key={index} className="academic-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", card.color)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="body-small text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="academic-card cursor-pointer transition-all duration-200 hover:shadow-md group"
            onClick={() => router.push(action.href)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="body-small text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botón de acción flotante */}
      <div className="fixed right-6 bottom-6 z-50 lg:bottom-22">
        <AddActionHandler role={role} />
      </div>
    </div>
  );
};

export default DashAdminPreceptorTeacher;
