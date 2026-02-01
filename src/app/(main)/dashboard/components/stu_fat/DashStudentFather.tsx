"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  BookOpen,
  AlertCircle,
  FileText,
  GraduationCap,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  ClipboardList,
  Mail,
} from "lucide-react";
import { Exam, translateExamType } from "@/utils/types";
import { LoadingSpinner, PageHeader, Card, CardContent, Badge, Progress } from "@/components/sacred";

import { parseLocalDate } from "@/utils/dateHelpers";
import axios from "axios";
import childSelectionStore from "@/store/childSelectionStore";

interface Grade {
  id: number;
  grade: number;
  grade_type: string;
  subject_id: number;
}

interface Attendance {
  id: number;
  presence: string;
  date: string;
}

interface Message {
  id: number;
  title: string;
  created_at: string;
}

function getGradeColor(average: number): string {
  if (average >= 8) return "text-grade-excellent";
  if (average >= 6) return "text-grade-good";
  if (average >= 4) return "text-grade-average";
  return "text-grade-poor";
}

function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return "text-grade-excellent";
  if (percentage >= 75) return "text-grade-average";
  return "text-grade-poor";
}

export default function DashStudentFather() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { selectedChild } = childSelectionStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentParam = selectedChild?.id ? `?student_id=${selectedChild.id}` : '';

        const [examsRes, gradesRes, attendanceRes, messagesRes] = await Promise.all([
          axios.get(`/api/proxy/assessments/`, { withCredentials: true }),
          axios.get(`/api/proxy/grades${studentParam}`, { withCredentials: true }),
          axios.get(`/api/proxy/assistance${studentParam}`, { withCredentials: true }),
          axios.get(`/api/proxy/messages`, { withCredentials: true }),
        ]);

        const extractData = <T,>(res: { data: { data?: T[] } | T[] }): T[] => {
          if (res.data && typeof res.data === 'object' && 'data' in res.data) {
            return res.data.data || [];
          }
          return Array.isArray(res.data) ? res.data : [];
        };

        setExams(extractData(examsRes));
        setGrades(extractData(gradesRes));
        setAttendance(extractData(attendanceRes));
        setMessages(extractData(messagesRes));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChild?.id]);

  const gradeAverage = useMemo(() => {
    const numericalGrades = grades.filter(g => g.grade_type === 'numerical' || !g.grade_type);
    if (numericalGrades.length === 0) return null;
    const sum = numericalGrades.reduce((acc, g) => acc + Number(g.grade), 0);
    return (sum / numericalGrades.length).toFixed(1);
  }, [grades]);

  const attendanceStats = useMemo(() => {
    if (attendance.length === 0) return null;
    const present = attendance.filter(a => a.presence === 'present' || a.presence === 'justified').length;
    const percentage = Math.round((present / attendance.length) * 100);
    return { percentage, total: attendance.length };
  }, [attendance]);

  const pendingHomework = useMemo(() => {
    const now = new Date();
    return exams.filter(e => {
      const dueDate = parseLocalDate(e.due_date);
      return e.type === 'homework' && dueDate >= now;
    }).length;
  }, [exams]);

  const getExamUrgency = (dateString: string): { label: string; variant: "error" | "warning" | "info" } | null => {
    const examDate = parseLocalDate(dateString);
    const today = new Date();
    const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = examDateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: "Hoy", variant: "error" };
    if (diffDays === 1) return { label: "Manana", variant: "warning" };
    if (diffDays > 1 && diffDays <= 3) return { label: "Proximo", variant: "info" };
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

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Tu resumen academico" />

      {/* Stats with color indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Promedio General</p>
              <p className={`text-2xl font-semibold mt-1 ${
                gradeAverage ? getGradeColor(Number(gradeAverage)) : "text-text-primary"
              }`}>
                {gradeAverage ?? "-"}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-text-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Asistencia</p>
                <p className={`text-2xl font-semibold mt-1 ${
                  attendanceStats ? getAttendanceColor(attendanceStats.percentage) : "text-text-primary"
                }`}>
                  {attendanceStats ? `${attendanceStats.percentage}%` : "-"}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-text-muted" />
            </div>
            {attendanceStats && (
              <Progress value={attendanceStats.percentage} className="mt-2 h-1.5" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Tareas Pendientes</p>
              <p className="text-2xl font-semibold mt-1 text-text-primary">{pendingHomework}</p>
            </div>
            <ClipboardList className="h-5 w-5 text-text-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-secondary">Mensajes</p>
              <p className="text-2xl font-semibold mt-1 text-text-primary">{messages.length}</p>
            </div>
            <Mail className="h-5 w-5 text-text-muted" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions as cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Acciones rapidas</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: FileText, title: "Calificaciones", href: "/calificaciones" },
              { icon: BookOpen, title: "Examenes", href: "/examenes" },
              { icon: Calendar, title: "Horarios", href: "/horario" },
              { icon: MessageCircle, title: "Chat", href: "/chat" },
            ].map((action, index) => (
              <button
                key={index}
                className="sacred-card-interactive flex flex-col items-center gap-2 py-4"
                onClick={() => router.push(action.href)}
              >
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-text-primary">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Proximos examenes</h3>
            {exams.length > 3 && (
              <button
                onClick={() => router.push("/examenes")}
                className="text-xs text-primary hover:underline"
              >
                Ver todos
              </button>
            )}
          </div>
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
                        ? "text-error"
                        : urgency.variant === "warning"
                          ? "text-warning"
                          : "text-status-info";
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
