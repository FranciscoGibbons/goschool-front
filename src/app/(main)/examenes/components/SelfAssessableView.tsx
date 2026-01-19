"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/sacred";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/sacred";

import { 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Users,
  PieChart,
  BarChart3,
  Activity
} from "lucide-react";
import SelfAssessableList from "./SelfAssessableList";
import { cn } from "@/lib/utils";
import type { SelfAssessableExam } from "@/utils/types";

interface SelfAssessableViewProps {
  exams: SelfAssessableExam[];
  subjects: Array<{ id: number; name: string }>;
  role: string;
  className?: string;
}

export default function SelfAssessableView({
  exams,
  subjects,
  role,
  className,
}: SelfAssessableViewProps) {
  const [stats, setStats] = useState({
    total: 0,
    bySubject: [] as Array<{ subject: string; count: number }>,
    byStatus: {
      available: 0,
      completed: 0,
      pending: 0,
      expired: 0,
    },
    upcoming: [] as SelfAssessableExam[],
  });

  // Calcular estadísticas
  useEffect(() => {
    const calculateStats = () => {
      const total = exams.length;
      
      // Por materia
      const subjectMap = new Map<string, number>();
      exams.forEach(exam => {
        const subject = subjects.find(s => s.id === exam.subject_id);
        const subjectName = subject?.name || "Sin materia";
        subjectMap.set(subjectName, (subjectMap.get(subjectName) || 0) + 1);
      });
      
      const bySubject = Array.from(subjectMap.entries()).map(([subject, count]) => ({
        subject,
        count,
      }));

      // Por estado (lógica simplificada)
      const today = new Date();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      let available = 0;
      const completed = 0; // Esto se calculará en tiempo real en el componente
      let pending = 0;
      let expired = 0;

      const upcoming: SelfAssessableExam[] = [];

      exams.forEach(exam => {
        const [year, month, day] = exam.due_date.split("-").map(Number);
        const dueOnly = new Date(year, month - 1, day);
        
        if (todayOnly < dueOnly) {
          pending++;
          // Los próximos 7 días
          if (dueOnly.getTime() - todayOnly.getTime() <= 7 * 24 * 60 * 60 * 1000) {
            upcoming.push(exam);
          }
        } else if (todayOnly.getTime() === dueOnly.getTime()) {
          available++;
        } else {
          expired++;
        }
      });

      setStats({
        total,
        bySubject,
        byStatus: { available, completed, pending, expired },
        upcoming: upcoming.slice(0, 5), // Solo los próximos 5
      });
    };

    calculateStats();
  }, [exams, subjects]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-text-primary">
            <BookOpen className="h-6 w-6 text-primary" />
            Autoevaluables
          </h2>
          <p className="text-text-secondary">
            Sistema de evaluación interactiva y autónoma
          </p>
        </div>
        <Badge variant="neutral">
          {stats.total} total
        </Badge>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        {/* Vista de Lista */}
        <TabsContent value="list" className="space-y-6">
          <SelfAssessableList
            exams={exams}
            subjects={subjects}
            role={role}
          />
        </TabsContent>

        {/* Vista de Estadísticas */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Estadísticas por estado */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Disponibles hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-primary">
                  {stats.byStatus.available}
                </div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Activity className="h-3 w-3" />
                  Activos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-warning">
                  {stats.byStatus.pending}
                </div>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <Calendar className="h-3 w-3" />
                  Próximos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Vencidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-error">
                  {stats.byStatus.expired}
                </div>
                <div className="flex items-center gap-1 text-xs text-error">
                  <TrendingUp className="h-3 w-3" />
                  Pasados
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total materias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-text-primary">
                  {stats.bySubject.length}
                </div>
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Users className="h-3 w-3" />
                  Activas
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por materia */}
          {stats.bySubject.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Materia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.bySubject.map(({ subject, count }, index) => {
                    const percentage = (count / stats.total) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate text-text-primary">{subject}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-full bg-surface-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-text-muted min-w-[3rem]">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="neutral" className="ml-2">
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vista de Calendario */}
        <TabsContent value="calendar" className="space-y-6">
          {/* Próximos autoevaluables */}
          {stats.upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Autoevaluables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.upcoming.map((exam) => {
                    const subject = subjects.find(s => s.id === exam.subject_id);
                    const [year, month, day] = exam.due_date.split("-").map(Number);
                    const dueDate = new Date(year, month - 1, day);
                    const today = new Date();
                    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{exam.task}</div>
                          <div className="text-sm text-text-secondary">
                            {subject?.name || "Sin materia"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-text-primary">
                            {dueDate.toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short"
                            })}
                          </div>
                          <Badge
                            variant={daysUntil <= 1 ? "error" : daysUntil <= 3 ? "warning" : "neutral"}
                          >
                            {daysUntil === 0 ? "Hoy" :
                             daysUntil === 1 ? "Mañana" :
                             `${daysUntil} días`}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendario visual simplificado */}
          <Card>
            <CardHeader>
              <CardTitle>Vista de Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-text-secondary py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Vista de calendario próximamente</p>
                <p className="text-sm">Mientras tanto, revisa los próximos autoevaluables arriba</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}