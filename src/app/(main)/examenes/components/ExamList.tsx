"use client";

import { useState, useEffect } from "react";
import {
  Exam,
  Role,
  translateExamType,
  getExamTypeIndicatorColor,
} from "@/utils/types";
import SelfAssessableCard from "./SelfAssessableCard";
import { BookOpenIcon, CalendarIcon } from "@heroicons/react/24/outline";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInView } from "react-intersection-observer";

interface Props {
  exams: Exam[];
  role: Role;
  subjects: { id: number; name: string }[];
}

export default function ExamList({ exams, role, subjects }: Props) {
  const [filter, setFilter] = useState<string>("date_asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Intersection Observer para detectar cuando el usuario llega al final
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Cargar más exámenes cuando el usuario llega al final
  useEffect(() => {
    if (inView) {
      setVisibleCount((prev) => Math.min(prev + 10, filteredExams.length));
    }
  }, [inView]);

  // Resetear el contador cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(10);
  }, [filter, typeFilter]);

  // Ordenar y filtrar exámenes
  let filteredExams = [...exams];
  if (typeFilter !== "all") {
    filteredExams = filteredExams.filter((exam) => exam.type === typeFilter);
  }
  if (filter === "date_asc") {
    filteredExams.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
  } else if (filter === "date_desc") {
    filteredExams.sort(
      (a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );
  }

  // Obtener solo los exámenes visibles
  const visibleExams = filteredExams.slice(0, visibleCount);

  // Obtener tipos únicos
  const examTypes = Array.from(new Set(exams.map((e) => e.type)));

  const getSubjectName = (id: number) => {
    const subject = subjects.find((s) => s.id === id);
    return subject ? subject.name : `ID: ${id}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <EmptyStateSVG className="w-96 h-72 mb-4 opacity-80" />
        <span className="text-muted-foreground text-lg opacity-60">
          No hay evaluaciones asignadas
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selectores de filtro/ordenamiento */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Ordenar por fecha de entrega" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_asc">
              Fecha de entrega: más próxima primero
            </SelectItem>
            <SelectItem value="date_desc">
              Fecha de entrega: más lejana primero
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo de examen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {examTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {translateExamType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contador de exámenes mostrados */}
      <div className="text-sm text-muted-foreground">
        Mostrando {visibleExams.length} de {filteredExams.length} evaluaciones
      </div>

      {/* Lista de exámenes filtrada y ordenada */}
      {visibleExams.map((exam, index) =>
        exam.type === "selfassessable" ? (
          <div
            key={exam.id}
            className="exam-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <SelfAssessableCard
              exam={exam}
              subjectName={getSubjectName(exam.subject_id)}
              role={role}
            />
          </div>
        ) : (
          <div
            key={exam.id}
            className="relative rounded-xl border border-border bg-card shadow-sm px-6 py-4 exam-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Status indicator */}
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getExamTypeIndicatorColor(
                    exam.type
                  )}`}
                ></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {translateExamType(exam.type)}
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {exam.task}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Evaluación de {getSubjectName(exam.subject_id)}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Entrega: {formatDate(exam.due_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{getSubjectName(exam.subject_id)}</span>
                </div>
              </div>

              {/* Special notice for oral exams */}
              {role !== "student" && exam.type === "oral" && (
                <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-medium">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Evaluación oral
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Requiere corrección manual por parte del docente
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* Elemento "sentinela" para detectar cuando cargar más */}
      {visibleCount < filteredExams.length && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando más evaluaciones...</span>
          </div>
        </div>
      )}

      {/* Mensaje cuando se han cargado todos */}
      {visibleCount >= filteredExams.length && filteredExams.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <span>Has visto todas las evaluaciones</span>
        </div>
      )}
    </div>
  );
}
