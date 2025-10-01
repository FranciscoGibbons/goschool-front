"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  BookOpen,
  ArrowRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Exam, translateExamType } from "@/utils/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import axios from "axios";

export default function DashStudentFather() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`/api/proxy/assessments/`, {
          withCredentials: true,
        });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExamTypeLabel = (type: string) => {
    return translateExamType(type);
  };

  const isExamSoon = (dateString: string) => {
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const upcomingExams = exams.slice(0, 3);

  return (
    <div className="dashboard-no-scroll h-full bg-background">
      <div className="dashboard-container container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header Section */}
        <div className="dashboard-header space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Bienvenido. Aquí está el resumen de hoy.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Evaluaciones
                  </p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {exams.length}
                </p>
              </div>
              <div className="icon-wrapper">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content gap-8">
          {/* Quick Actions */}
          <div className="dashboard-section space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Acciones Rápidas</h3>
            <div className="space-y-4">
              <div
                className="action-card group"
                onClick={() => router.push("/calificaciones")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="icon-wrapper">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        Ver Calificaciones
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Consultar notas
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              <div
                className="action-card group"
                onClick={() => router.push("/examenes")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="icon-wrapper">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        Ver Exámenes
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Próximas evaluaciones
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              <div
                className="action-card group"
                onClick={() => router.push("/horario")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="icon-wrapper">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        Ver Horarios
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Consultar cronograma
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-section space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Próximos Eventos</h3>
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <div key={exam.id} className="dashboard-card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="status-indicator exam-pending">
                          exam
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{exam.task}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getExamTypeLabel(exam.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(exam.due_date)}
                        </p>
                        {isExamSoon(exam.due_date) && (
                          <div className="flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>Próximo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-card text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="font-medium text-foreground mb-2">No hay exámenes próximos</h4>
                  <p className="text-sm text-muted-foreground">
                    ¡Perfecto! No tienes evaluaciones pendientes por ahora
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
