import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SelfAssessableCard from "./SelfAssessableCard";
import { useSelfAssessable } from "@/hooks/useSelfAssessable";
import { toast } from "sonner";
import type { SelfAssessableExam } from "@/utils/types";

interface SelfAssessableListProps {
  exams: SelfAssessableExam[];
  subjects: Array<{ id: number; name: string }>;
  role: string;
  className?: string;
}

interface FilterState {
  search: string;
  subject: string;
  status: string;
  sortBy: "name" | "due_date" | "created_at";
}

export default function SelfAssessableList({
  exams,
  subjects,
  role,
  className,
}: SelfAssessableListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    subject: "",
    status: "",
    sortBy: "due_date",
  });
  
  const [answeredExams, setAnsweredExams] = useState<Set<number>>(new Set());
  const [loadingAnswered, setLoadingAnswered] = useState(false);

  const { checkIfAnswered } = useSelfAssessable({ autoLoad: false });

  // Función para verificar qué exámenes ya fueron respondidos
  const checkAnsweredExams = useCallback(async () => {
    if (role !== "student" || exams.length === 0) return;

    setLoadingAnswered(true);
    try {
      const answeredPromises = exams.map(async (exam) => {
        try {
          const answered = await checkIfAnswered(exam.id);
          return { id: exam.id, answered };
        } catch {
          return { id: exam.id, answered: false };
        }
      });

      const results = await Promise.all(answeredPromises);
      const answered = new Set(
        results.filter(r => r.answered).map(r => r.id)
      );
      setAnsweredExams(answered);
    } catch (error) {
      console.error("Error checking answered exams:", error);
      toast.error("Error al verificar el estado de los autoevaluables");
    } finally {
      setLoadingAnswered(false);
    }
  }, [role, exams, checkIfAnswered]);

  // Verificar exámenes respondidos al cargar
  useEffect(() => {
    checkAnsweredExams();
  }, [checkAnsweredExams]);

  // Función para determinar el estado de un examen
  const getExamStatus = (exam: SelfAssessableExam): "pending" | "available" | "completed" | "expired" => {
    if (answeredExams.has(exam.id)) return "completed";

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [year, month, day] = exam.due_date.split("-").map(Number);
    const dueOnly = new Date(year, month - 1, day);

    if (todayOnly < dueOnly) return "pending";
    if (todayOnly.getTime() === dueOnly.getTime()) return "available";
    return "expired";
  };

  // Función para filtrar exámenes
  const filteredExams = exams.filter((exam) => {
    const subjectName = subjects.find(s => s.id === exam.subject_id)?.name || "";
    const matchesSearch = filters.search === "" || 
      exam.task.toLowerCase().includes(filters.search.toLowerCase()) ||
      subjectName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSubject = filters.subject === "" || 
      exam.subject_id?.toString() === filters.subject;

    const examStatus = getExamStatus(exam);
    const matchesStatus = filters.status === "" || examStatus === filters.status;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Función para ordenar exámenes
  const sortedExams = filteredExams.sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.task.localeCompare(b.task);
      case "due_date":
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case "created_at":
        return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
      default:
        return 0;
    }
  });

  // Función para contar exámenes por estado
  const getStatusCounts = () => {
    const counts = {
      total: exams.length,
      pending: 0,
      available: 0,
      completed: 0,
      expired: 0,
    };

    exams.forEach((exam) => {
      const status = getExamStatus(exam);
      counts[status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Estadísticas */}
      {role === "student" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{statusCounts.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.available}</div>
              <div className="text-sm text-muted-foreground">Disponibles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-muted-foreground">Completados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
              <div className="text-sm text-muted-foreground">Vencidos</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </h3>
            {loadingAnswered && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando estado...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar autoevaluables..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Filtro por materia */}
            <Select
              value={filters.subject}
              onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las materias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las materias</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por estado (solo para estudiantes) */}
            {role === "student" && (
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="available">Disponibles hoy</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Ordenar por */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as FilterState["sortBy"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date">Fecha de vencimiento</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="created_at">Fecha de creación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros rápidos */}
          {role === "student" && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.status === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, status: "" }))}
              >
                Todos ({statusCounts.total})
              </Button>
              <Button
                variant={filters.status === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, status: "available" }))}
                className="text-blue-600"
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                Disponibles ({statusCounts.available})
              </Button>
              <Button
                variant={filters.status === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, status: "completed" }))}
                className="text-green-600"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Completados ({statusCounts.completed})
              </Button>
              <Button
                variant={filters.status === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, status: "pending" }))}
                className="text-gray-600"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pendientes ({statusCounts.pending})
              </Button>
              {statusCounts.expired > 0 && (
                <Button
                  variant={filters.status === "expired" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, status: "expired" }))}
                  className="text-red-600"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Vencidos ({statusCounts.expired})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Autoevaluables ({sortedExams.length})
          </h3>
          {sortedExams.length !== exams.length && (
            <Badge variant="outline">
              {sortedExams.length} de {exams.length} resultados
            </Badge>
          )}
        </div>

        {/* Lista de autoevaluables */}
        {sortedExams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay autoevaluables</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.subject || filters.status
                  ? "No se encontraron autoevaluables que coincidan con los filtros aplicados."
                  : "Aún no hay autoevaluables disponibles."}
              </p>
              {(filters.search || filters.subject || filters.status) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilters({ search: "", subject: "", status: "", sortBy: "due_date" })}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedExams.map((exam) => {
              const subjectName = subjects.find(s => s.id === exam.subject_id)?.name || "Sin materia";
              return (
                <SelfAssessableCard
                  key={exam.id}
                  exam={exam}
                  subjectName={subjectName}
                  role={role}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}