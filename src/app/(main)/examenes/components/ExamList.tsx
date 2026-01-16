"use client";

import { useState, useEffect } from "react";
import {
  Exam,
  Role,
  SelfAssessableExam,
  translateExamType,
} from "@/utils/types";
import SelfAssessableCard from "./SelfAssessableCard";
import SelfAssessableView from "./SelfAssessableView";
import {
  Calendar,
  BookOpen,
  Pencil,
  Trash2,
  Filter,
  FileText,
  ChevronDown,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInView } from "react-intersection-observer";
import userInfoStore from "@/store/userInfoStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Props {
  exams: Exam[];
  role: Role;
  subjects: { id: number; name: string; course_name?: string }[];
}

const typeColors: Record<string, string> = {
  exam: "status-badge-info",
  homework: "status-badge-warning",
  project: "status-badge-success",
  oral: "status-badge-neutral",
  remedial: "status-badge-error",
  selfassessable: "status-badge-success",
};

export default function ExamList({ exams, role, subjects }: Props) {
  const [filter, setFilter] = useState<string>("date_asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editData, setEditData] = useState<Exam | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { userInfo } = userInfoStore();
  const router = useRouter();

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

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      setVisibleCount((prev) => Math.min(prev + 15, filteredExams.length));
    }
  }, [inView, filteredExams.length]);

  useEffect(() => {
    setVisibleCount(15);
  }, [filter, typeFilter]);

  useEffect(() => {
    if (editingExam) {
      setEditData({ ...editingExam });
    } else {
      setEditData(null);
    }
  }, [editingExam]);

  const selfAssessableExams = filteredExams.filter(
    (exam) => exam.type === "selfassessable"
  ) as SelfAssessableExam[];

  if (typeFilter === "selfassessable") {
    return (
      <SelfAssessableView
        exams={selfAssessableExams}
        subjects={subjects}
        role={role}
      />
    );
  }

  const visibleExams = filteredExams.slice(0, visibleCount);
  const examTypes = Array.from(new Set(exams.map((e) => e.type)));

  const cleanSubjectName = (name: string) => {
    return name.replace(/\s*-\s*\d+°\d+\s*$/, "").trim();
  };

  const getSubjectName = (id: number) => {
    const subject = subjects.find((s) => s.id === id);
    if (!subject) return `ID: ${id}`;
    return cleanSubjectName(subject.name);
  };

  const formatDate = (date: string) => {
    // Fix timezone issue - add one day to compensate for UTC conversion
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta evaluacion?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/proxy/assessments/${id}/`, {
        withCredentials: true,
      });
      toast.success("Evaluacion eliminada");
      router.refresh();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (!editingExam || !editData) return;
    setIsSaving(true);
    try {
      const res = await axios.put(
        `/api/proxy/assessments/${editingExam.id}/`,
        {
          subject_id: Number(editData.subject_id),
          task: editData.task,
          due_date: editData.due_date,
          type: editData.type,
        },
        { withCredentials: true }
      );
      if (res.status >= 200 && res.status < 300) {
        toast.success("Evaluacion actualizada");
        setEditingExam(null);
        router.refresh();
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit =
    userInfo?.role &&
    ["admin", "teacher", "preceptor"].includes(userInfo.role);

  if (exams.length === 0) {
    return (
      <div className="empty-state">
        <FileText className="empty-state-icon" />
        <p className="empty-state-title">Sin evaluaciones</p>
        <p className="empty-state-text">No hay evaluaciones programadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_asc">Fecha: proximas</SelectItem>
            <SelectItem value="date_desc">Fecha: lejanas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {examTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {translateExamType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {visibleExams.length} de {filteredExams.length} evaluaciones
      </p>

      {/* List */}
      <div className="space-y-2">
        {visibleExams.map((exam) =>
          exam.type === "selfassessable" ? (
            <div key={exam.id} className="animate-fade-in">
              <SelfAssessableCard
                exam={exam as SelfAssessableExam}
                subjectName={getSubjectName(exam.subject_id)}
                role={role}
              />
            </div>
          ) : (
            <div
              key={exam.id}
              className="minimal-card flex items-start justify-between gap-4 animate-fade-in"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn("status-badge", typeColors[exam.type] || "")}
                  >
                    {translateExamType(exam.type)}
                  </span>
                </div>
                <h3 className="text-sm font-medium truncate">{exam.task}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {getSubjectName(exam.subject_id)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(exam.due_date)}
                  </span>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingExam(exam)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(exam.id)}
                    disabled={deletingId === exam.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Load more */}
      {visibleCount < filteredExams.length && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Cargando mas...</span>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingExam} onOpenChange={() => setEditingExam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar evaluacion</DialogTitle>
          </DialogHeader>
          {editData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Materia</Label>
                <Select
                  value={String(editData.subject_id)}
                  onValueChange={(v) =>
                    setEditData({ ...editData, subject_id: parseInt(v) })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {cleanSubjectName(s.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Titulo</Label>
                <Input
                  value={editData.task}
                  onChange={(e) =>
                    setEditData({ ...editData, task: e.target.value })
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Fecha</Label>
                <Input
                  type="date"
                  value={editData.due_date}
                  onChange={(e) =>
                    setEditData({ ...editData, due_date: e.target.value })
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Tipo</Label>
                <Select
                  value={editData.type}
                  onValueChange={(v) =>
                    setEditData({ ...editData, type: v as Exam["type"] })
                  }
                  disabled={editData.type === "selfassessable"}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">Examen</SelectItem>
                    <SelectItem value="homework">Tarea</SelectItem>
                    <SelectItem value="project">Proyecto</SelectItem>
                    <SelectItem value="oral">Oral</SelectItem>
                    <SelectItem value="remedial">Recuperatorio</SelectItem>
                    <SelectItem value="selfassessable">Autoevaluable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingExam(null)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
