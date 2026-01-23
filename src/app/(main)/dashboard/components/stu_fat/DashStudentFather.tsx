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
                    {isExamSoon(exam.due_date) && (
                      <div className="flex items-center gap-1 text-xs text-warning">
                        <AlertCircle className="h-3 w-3" />
                        <span>Proximo</span>
                      </div>
                    )}
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
