"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/sacred";

import {
  Search,
  BookOpen,
  Clock,
  Check,
  Play,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SelfAssessableCard from "./SelfAssessableCard";
import { useSelfAssessable } from "@/hooks/useSelfAssessable";
import { toast } from "sonner";
import { parseLocalDate } from "@/utils/dateHelpers";
import type { SelfAssessableExam } from "@/utils/types";

interface SelfAssessableListProps {
  exams: SelfAssessableExam[];
  subjects: Array<{ id: number; name: string; course_name?: string }>;
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

  const cleanSubjectName = (name: string) => {
    return name.replace(/\s*-\s*\d+°\d+\s*$/, "").trim();
  };

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
      const answered = new Set(results.filter((r) => r.answered).map((r) => r.id));
      setAnsweredExams(answered);
    } catch (error) {
      console.error("Error checking answered exams:", error);
      toast.error("Error al verificar autoevaluables");
    } finally {
      setLoadingAnswered(false);
    }
  }, [role, exams, checkIfAnswered]);

  useEffect(() => {
    checkAnsweredExams();
  }, [checkAnsweredExams]);

  const getExamStatus = (
    exam: SelfAssessableExam
  ): "pending" | "available" | "completed" | "expired" => {
    if (answeredExams.has(exam.id)) return "completed";

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueDate = parseLocalDate(exam.due_date);
    const dueOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    if (todayOnly < dueOnly) return "pending";
    if (todayOnly.getTime() === dueOnly.getTime()) return "available";
    return "expired";
  };

  const filteredExams = exams.filter((exam) => {
    const subjectName = subjects.find((s) => s.id === exam.subject_id)?.name || "";
    const matchesSearch =
      filters.search === "" ||
      exam.task.toLowerCase().includes(filters.search.toLowerCase()) ||
      subjectName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSubject =
      filters.subject === "" || exam.subject_id?.toString() === filters.subject;

    const examStatus = getExamStatus(exam);
    const matchesStatus = filters.status === "" || examStatus === filters.status;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const sortedExams = filteredExams.sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.task.localeCompare(b.task);
      case "due_date":
        return parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime();
      case "created_at":
        return (
          new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
        );
      default:
        return 0;
    }
  });

  const getStatusCounts = () => {
    const counts = { total: exams.length, pending: 0, available: 0, completed: 0, expired: 0 };
    exams.forEach((exam) => {
      const status = getExamStatus(exam);
      counts[status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats */}
      {role === "student" && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="sacred-card text-center">
            <p className="text-2xl font-semibold">{statusCounts.total}</p>
            <p className="text-xs text-text-secondary">Total</p>
          </div>
          <div className="sacred-card text-center">
            <p className="text-2xl font-semibold text-text-secondary">{statusCounts.pending}</p>
            <p className="text-xs text-text-muted">Pendientes</p>
          </div>
          <div className="sacred-card text-center">
            <p className="text-2xl font-semibold text-primary">{statusCounts.available}</p>
            <p className="text-xs text-text-muted">Disponibles</p>
          </div>
          <div className="sacred-card text-center">
            <p className="text-2xl font-semibold text-success">{statusCounts.completed}</p>
            <p className="text-xs text-text-muted">Completados</p>
          </div>
          <div className="sacred-card text-center">
            <p className="text-2xl font-semibold text-error">{statusCounts.expired}</p>
            <p className="text-xs text-text-muted">Vencidos</p>
          </div>
        </div>

      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="pl-9 h-9"
          />
        </div>

        <Select
          value={filters.subject}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, subject: value }))}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Materia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {cleanSubjectName(subject.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {role === "student" && (
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, sortBy: value as FilterState["sortBy"] }))
          }
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date">Fecha</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="created_at">Creacion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick filters */}
      {role === "student" && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.status === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, status: "" }))}
            className="h-8 text-xs"
          >
            Todos ({statusCounts.total})
          </Button>
          <Button
            variant={filters.status === "available" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, status: "available" }))}
            className="h-8 text-xs gap-1"
          >
            <Play className="h-3 w-3" />
            Disponibles ({statusCounts.available})
          </Button>
          <Button
            variant={filters.status === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, status: "completed" }))}
            className="h-8 text-xs gap-1"
          >
            <Check className="h-3 w-3" />
            Completados ({statusCounts.completed})
          </Button>
          <Button
            variant={filters.status === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, status: "pending" }))}
            className="h-8 text-xs gap-1"
          >
            <Clock className="h-3 w-3" />
            Pendientes ({statusCounts.pending})
          </Button>
          {statusCounts.expired > 0 && (
            <Button
              variant={filters.status === "expired" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, status: "expired" }))}
              className="h-8 text-xs gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Vencidos ({statusCounts.expired})
            </Button>
          )}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Autoevaluables ({sortedExams.length})
        </h3>
        {loadingAnswered && (
          <span className="text-xs text-text-secondary animate-pulse">
            Verificando estado...
          </span>
        )}
      </div>

      {/* List */}
      {sortedExams.length === 0 ? (
        <div className="sacred-card text-center py-8">
          <BookOpen className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Sin autoevaluables</p>
          <p className="text-sm text-text-secondary mt-1">
            {filters.search || filters.subject || filters.status
              ? "No se encontraron resultados"
              : "No hay autoevaluables disponibles"}
          </p>
          {(filters.search || filters.subject || filters.status) && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() =>
                setFilters({ search: "", subject: "", status: "", sortBy: "due_date" })
              }
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedExams.map((exam) => {
            const subjectName =
              subjects.find((s) => s.id === exam.subject_id)?.name || "Sin materia";
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
  );
}
