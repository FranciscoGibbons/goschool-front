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
} from "lucide-react";
import { Exam, translateExamType } from "@/utils/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
        setExams(res.data);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const isExamSoon = (dateString: string) => {
    const examDate = parseLocalDate(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
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
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Tu resumen academico</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="minimal-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Evaluaciones</p>
              <p className="text-2xl font-semibold mt-1">{exams.length}</p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Acciones rapidas</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full minimal-card hover:border-foreground/20 transition-colors"
                onClick={() => router.push(action.href)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Proximos examenes</h3>
          {upcomingExams.length > 0 ? (
            <div className="space-y-2">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="minimal-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="status-badge">{translateExamType(exam.type)}</span>
                      <div>
                        <p className="text-sm font-medium">{exam.task}</p>
                        <p className="text-xs text-muted-foreground">
                          {parseLocalDate(exam.due_date).toLocaleDateString("es-AR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    {isExamSoon(exam.due_date) && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>Proximo</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <GraduationCap className="empty-state-icon" />
              <p className="empty-state-title">Sin examenes</p>
              <p className="empty-state-text">No tienes evaluaciones pendientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
