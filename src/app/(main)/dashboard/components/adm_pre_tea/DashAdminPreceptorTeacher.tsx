"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role, FormsObj } from "@/utils/types";
import {
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  ArrowRight,
  School,
  FileText,
  Settings,
  Plus,
  GraduationCap,
  Clock,
  MessageCircle,
} from "lucide-react";
import { LoadingSpinner, PageHeader, Card, CardContent } from "@/components/sacred";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import "../../dashboard-modal.css";
import { ActionForm } from "./ActionForm";

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

const getCreateActionsForRole = (role: ActionableRole) => {
  switch (role) {
    case "admin":
      return [
        { key: "Crear mensaje" as keyof FormsObj, label: "Nuevo Mensaje", icon: MessageSquare },
        { key: "Crear examen" as keyof FormsObj, label: "Nuevo Examen", icon: FileText },
        { key: "Crear conducta" as keyof FormsObj, label: "Registrar Conducta", icon: ClipboardCheck },
        { key: "Crear asistencia" as keyof FormsObj, label: "Tomar Asistencia", icon: UserCheck },
      ];
    case "preceptor":
      return [
        { key: "Crear mensaje" as keyof FormsObj, label: "Nuevo Mensaje", icon: MessageSquare },
        { key: "Crear conducta" as keyof FormsObj, label: "Registrar Conducta", icon: ClipboardCheck },
        { key: "Crear asistencia" as keyof FormsObj, label: "Tomar Asistencia", icon: UserCheck },
      ];
    case "teacher":
      return [
        { key: "Crear examen" as keyof FormsObj, label: "Nuevo Examen", icon: FileText },
        { key: "Cargar calificación" as keyof FormsObj, label: "Cargar Nota", icon: GraduationCap },
        { key: "Crear mensaje de materia" as keyof FormsObj, label: "Mensaje a Materia", icon: MessageSquare },
      ];
    default:
      return [];
  }
};

const DashAdminPreceptorTeacher = ({ role }: { role: ActionableRole }) => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [createAction, setCreateAction] = useState<keyof FormsObj | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const getNavigationLinks = () => {
    switch (role) {
      case "preceptor":
        return [
          { icon: UserCheck, title: "Asistencia", subtitle: "Ver y tomar asistencia", href: "/asistencia" },
          { icon: ClipboardCheck, title: "Conducta", subtitle: "Registro disciplinario", href: "/conducta" },
          { icon: MessageSquare, title: "Mensajes", subtitle: "Ver comunicaciones", href: "/mensajes" },
          { icon: Clock, title: "Horarios", subtitle: "Ver horarios", href: "/horario" },
        ];
      case "teacher":
        return [
          { icon: FileText, title: "Calificaciones", subtitle: "Notas de estudiantes", href: "/calificaciones" },
          { icon: GraduationCap, title: "Evaluaciones", subtitle: "Examenes programados", href: "/examenes" },
          { icon: BookOpen, title: "Asignaturas", subtitle: "Tus materias", href: "/asignaturas" },
        ];
      case "admin":
        return [
          { icon: Settings, title: "Panel Admin", subtitle: "Administrar sistema", href: "/admin" },
          { icon: FileText, title: "Calificaciones", subtitle: "Notas del sistema", href: "/calificaciones" },
          { icon: UserCheck, title: "Asistencia", subtitle: "Registro de asistencia", href: "/asistencia" },
          { icon: MessageSquare, title: "Mensajes", subtitle: "Comunicaciones", href: "/mensajes" },
        ];
      default:
        return [];
    }
  };

  const createActions = getCreateActionsForRole(role);
  const navigationLinks = getNavigationLinks();
  const statsCards = getStatsCards();

  const handleOpenCreate = (actionKey: keyof FormsObj) => {
    setCreateAction(actionKey);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          role === "preceptor"
            ? "Preceptoria"
            : role === "teacher"
            ? "Docente"
            : "Dashboard"
        }
        subtitle={
          role === "admin"
            ? "Panel de administracion"
            : role === "preceptor"
            ? "Panel de preceptoria"
            : "Panel del docente"
        }
      />

      {/* Create Actions - Big prominent buttons */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-3">Crear</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {createActions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleOpenCreate(action.key)}
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-left cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <action.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-primary">
                  {action.label}
                </p>
              </div>
              <Plus className="h-5 w-5 text-primary flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-3">Ir a</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {navigationLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted transition-all text-left cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-surface-muted">
                <link.icon className="h-5 w-5 text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{link.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{link.subtitle}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {statsCards.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-3">Resumen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-3">Acceso rapido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Horarios", href: "/horario", icon: Clock },
            { label: "Asignaturas", href: "/asignaturas", icon: BookOpen },
            { label: "Chat", href: "/chat", icon: MessageCircle },
            { label: "Evaluaciones", href: "/examenes", icon: GraduationCap },
          ].map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className="sacred-card-interactive flex flex-col items-center gap-2 py-4"
            >
              <link.icon className="h-5 w-5 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) setCreateAction(null);
      }}>
        <DialogContent className="max-w-2xl dashboard-modal-content">
          <DialogTitle>{createAction || "Crear"}</DialogTitle>
          {createAction && (
            <ActionForm
              action={createAction}
              onBack={() => {
                setCreateAction(null);
                setModalOpen(false);
              }}
              onClose={() => {
                setCreateAction(null);
                setModalOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashAdminPreceptorTeacher;
