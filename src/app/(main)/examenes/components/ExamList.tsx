"use client";

import { useState, useEffect } from "react";
import {
  Exam,
  Role,
  SelfAssessableExam,
  translateExamType,
  getExamTypeIndicatorColor,
} from "@/utils/types";
import SelfAssessableCard from "./SelfAssessableCard";
import {
  BookOpenIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInView } from "react-intersection-observer";
import userInfoStore from "@/store/userInfoStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

interface Props {
  exams: Exam[];
  role: Role;
  subjects: { id: number; name: string }[];
}

export default function ExamList({ exams, role, subjects }: Props) {
  const [filter, setFilter] = useState<string>("date_asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [updatingExam, setUpdatingExam] = useState<Exam | null>(null);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { userInfo } = userInfoStore();
  const router = useRouter();

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
  }, [inView, filteredExams.length]);

  // Resetear el contador cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(10);
  }, [filter, typeFilter]);

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

  // Función para borrar un examen
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres borrar este examen?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/proxy/assessments/${id}/`, {
        withCredentials: true,
      });
      toast.success("Examen borrado");
      router.refresh();
    } catch {
      toast.error("Error al borrar el examen");
    } finally {
      setDeletingId(null);
    }
  };

  // Cuando se abre el modal, inicializar editExam
  useEffect(() => {
    if (updatingExam) {
      setEditExam({ ...updatingExam });
    } else {
      setEditExam(null);
    }
  }, [updatingExam]);

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
              exam={exam as SelfAssessableExam}
              subjectName={getSubjectName(exam.subject_id)}
              role={role}
            />
            {/* Botones de acciones solo para admin/teacher/preceptor */}
            {userInfo?.role &&
              ["admin", "teacher", "preceptor"].includes(userInfo.role) && (
                <div className="flex gap-1 mt-2 justify-end">
                  <button
                    className="p-1 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted hover:rounded-sm"
                    title="Editar"
                    onClick={() => setUpdatingExam(exam)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-1 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted hover:rounded-sm"
                    title="Borrar"
                    onClick={() => handleDelete(exam.id)}
                    disabled={deletingId === exam.id}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
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
            {/* Botones de acciones solo para admin/teacher/preceptor */}
            {userInfo?.role &&
              ["admin", "teacher", "preceptor"].includes(userInfo.role) && (
                <div className="flex gap-1 mt-2 justify-end">
                  <button
                    className="p-1 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted hover:rounded-sm"
                    title="Editar"
                    onClick={() => setUpdatingExam(exam)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-1 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted hover:rounded-sm"
                    title="Borrar"
                    onClick={() => handleDelete(exam.id)}
                    disabled={deletingId === exam.id}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
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

      {/* Modal de actualización (solo UI, sin lógica de update aún) */}
      {updatingExam && editExam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg w-full max-w-md text-foreground">
            <h2 className="text-lg font-bold mb-4">Actualizar examen</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const res = await axios.put(
                    `/api/proxy/assessments/${updatingExam.id}/`,
                    {
                      subject_id: Number(editExam.subject_id),
                      task: editExam.task,
                      due_date: editExam.due_date,
                      type: editExam.type,
                    },
                    { withCredentials: true }
                  );
                  if (res.status >= 200 && res.status < 300) {
                    toast.success("Examen actualizado");
                    setUpdatingExam(null);
                    router.refresh();
                  } else {
                    toast.error("Error al actualizar el examen");
                  }
                } catch {
                  toast.error("Error de red al actualizar");
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Materia
                </label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editExam.subject_id}
                  onChange={(e) =>
                    setEditExam({
                      ...editExam,
                      subject_id: parseInt(e.target.value),
                    })
                  }
                  required
                  disabled={subjects.length === 0}
                >
                  {subjects.length === 0 && (
                    <option value="">No hay materias disponibles</option>
                  )}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editExam.task}
                  onChange={(e) =>
                    setEditExam({ ...editExam, task: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de entrega
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editExam.due_date}
                  onChange={(e) =>
                    setEditExam({ ...editExam, due_date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editExam.type}
                  onChange={(e) =>
                    setEditExam({
                      ...editExam,
                      type: e.target.value as Exam["type"],
                    })
                  }
                  required
                  disabled={editExam.type === "selfassessable"}
                >
                  <option value="exam">Examen</option>
                  <option value="homework">Tarea</option>
                  <option value="project">Proyecto</option>
                  <option value="oral">Oral</option>
                  <option value="remedial">Recuperatorio</option>
                  <option value="selfassessable">Autoevaluable</option>
                </select>
                {editExam.type === "selfassessable" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No se puede cambiar el tipo de un autoevaluable.
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  className="px-3 py-1 bg-red-500 text-black rounded hover:bg-red-600 flex items-center gap-1"
                  type="button"
                  onClick={() => setUpdatingExam(null)}
                  disabled={isSaving}
                >
                  <TrashIcon className="w-4 h-4" /> Cancelar
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-black rounded hover:bg-blue-600 flex items-center gap-1"
                  type="submit"
                  disabled={isSaving}
                >
                  <PencilIcon className="w-4 h-4" />{" "}
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
