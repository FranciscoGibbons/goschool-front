"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  BookOpen,
  ArrowRight,
  AlertCircle,
  FileText,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { Exam, translateExamType } from "@/utils/types";
import { LoadingSpinner, PageHeader, Card, CardContent, Badge } from "@/components/sacred";

import { parseLocalDate } from "@/utils/dateHelpers";
import axios from "axios";

export default function DashStudentFather() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`/api/proxy/assessments/`, { withCredentials: true });

        // Handle paginated response
        let data: Exam[];
        if (res.data && typeof res.data === 'object' && 'data' in res.data) {
          data = res.data.data;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        } else {
          data = [];
        }

        setExams(data);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getExamUrgency = (dateString: string): { label: string; variant: "error" | "warning" | "info" } | null => {
    const examDate = parseLocalDate(dateString);
    const today = new Date();

    // Reset time parts to compare dates only
    const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = examDateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: "Hoy", variant: "error" };
    } else if (diffDays === 1) {
      return { label: "Manana", variant: "warning" };
    } else if (diffDays > 1 && diffDays <= 3) {
      return { label: "Proximo", variant: "info" };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const upcomingExams = exams.slice(0, 3);

  const quickActions = [
    { icon: FileText, title: "Calificaciones", description: "Ver mis notas", href: "/calificaciones" },
    { icon: BookOpen, title: "Examenes", description: "Proximas evaluaciones", href: "/examenes" },
    { icon: Calendar, title: "Horarios", description: "Ver cronograma", href: "/horario" },
    { icon: MessageCircle, title: "Chat", description: "Conversaciones en tiempo real", href: "/chat" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Tu resumen academico" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Evaluaciones</p>
              <p className="text-2xl font-semibold mt-1 text-text-primary">{exams.length}</p>
            </div>
            <FileText className="h-5 w-5 text-text-muted" />
          </CardContent>
        </Card>
      </div>


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


        {/* Upcoming Exams */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Proximos examenes</h3>
          {upcomingExams.length > 0 ? (
            <div className="space-y-2">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="sacred-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Badge variant="info">{translateExamType(exam.type)}</Badge>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{exam.task}</p>
                        <p className="text-xs text-text-secondary">
                          {parseLocalDate(exam.due_date).toLocaleDateString("es-AR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const urgency = getExamUrgency(exam.due_date);
                      if (!urgency) return null;
                      const colorClass = urgency.variant === "error"
                        ? "text-red-500"
                        : urgency.variant === "warning"
                          ? "text-warning"
                          : "text-blue-500";
                      return (
                        <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
                          <AlertCircle className="h-3 w-3" />
                          <span>{urgency.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sacred-card text-center py-8">
              <GraduationCap className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary">Sin examenes</p>
              <p className="text-sm text-text-secondary">No tienes evaluaciones pendientes</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
