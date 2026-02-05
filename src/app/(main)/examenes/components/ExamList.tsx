"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  FileText,
  Upload,
  CheckCircle,
  Paperclip,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  Button,
  Input,
  Label,
  Badge,
} from "@/components/sacred";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInView } from "react-intersection-observer";
import userInfoStore from "@/store/userInfoStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useSubmissions } from "@/hooks/useSubmissions";
import { validateFile } from "@/types/submission";
import { useUploadLimits } from "@/hooks/useUploadLimits";


interface Props {
  exams: Exam[];
  role: Role;
  subjects: { id: number; name: string; course_name?: string }[];
}

const typeVariants: Record<string, "info" | "warning" | "success" | "neutral" | "error"> = {
  exam: "info",
  homework: "warning",
  project: "success",
  oral: "neutral",
  remedial: "error",
  selfassessable: "success",
};


export default function ExamList({ exams, role, subjects }: Props) {
  const [filter, setFilter] = useState<string>("date_asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editData, setEditData] = useState<Exam | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { userInfo } = userInfoStore();
  const router = useRouter();

  // Student submission state
  const [submittingHomeworkId, setSubmittingHomeworkId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = role === "student";
  const { limits: uploadLimits } = useUploadLimits();

  // Memoize filter to avoid re-fetching on every render
  const submissionFilter = useMemo(
    () => (isStudent && userInfo?.id ? { student_id: userInfo.id } : undefined),
    [isStudent, userInfo?.id]
  );

  // Fetch existing submissions for the student
  const { submissions, createSubmission, isLoading: isSubmissionLoading } = useSubmissions(
    submissionFilter
  );

  // Check if student already submitted for a given homework
  const hasSubmitted = (examId: number): boolean => {
    return submissions.some((s) => s.task_id === examId);
  };

  const handleSubmitHomework = async () => {
    if (!submittingHomeworkId || !selectedFile || !userInfo?.id) return;

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      toast.error(validation.error || "Archivo no valido");
      return;
    }

    const success = await createSubmission({
      student_id: userInfo.id,
      task_id: submittingHomeworkId,
      file: selectedFile,
    });

    if (success) {
      setSubmittingHomeworkId(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
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

  const handleSaveEdit = async () => {
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
      <div className="sacred-card text-center py-8">
        <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin evaluaciones</p>
        <p className="text-sm text-text-secondary mt-1">No hay evaluaciones programadas</p>
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
                className="sacred-card flex flex-col gap-2 animate-fade-in"
              >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                      <Badge variant={typeVariants[exam.type] || "neutral"}>
                        {translateExamType(exam.type)}
                      </Badge>
                      {/* Student: show submitted badge */}
                      {isStudent && exam.type === "homework" && hasSubmitted(exam.id) && (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Entregado
                        </Badge>
                      )}
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

                <div className="flex items-center gap-1">
                  {/* Student: submit homework button */}
                  {isStudent && exam.type === "homework" && !hasSubmitted(exam.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      title="Entregar tarea"
                      onClick={() => {
                        setSubmittingHomeworkId(exam.id);
                        setSelectedFile(null);
                      }}
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {canEdit && (
                    <>
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
                        onClick={() => setConfirmDeleteId(exam.id)}
                        disabled={deletingId === exam.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Teacher file attachment link */}
              {exam.file_path && (() => {
                let fileName = exam.file_path;
                if (fileName.includes('/uploads/files/')) {
                  fileName = fileName.split('/uploads/files/').pop() || fileName;
                }
                fileName = fileName.replace(/^\.\//, '');
                const proxyUrl = `/api/image-proxy/uploads/files/${fileName}`;
                return (
                  <a
                    href={proxyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline w-fit"
                  >
                    <Paperclip className="h-3 w-3" />
                    Ver archivo adjunto
                  </a>
                );
              })()}
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

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar evaluacion</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara esta evaluacion. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Homework Modal */}
      <Modal open={submittingHomeworkId !== null} onOpenChange={() => {
        setSubmittingHomeworkId(null);
        setSelectedFile(null);
      }}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Entregar tarea</ModalTitle>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="homework_file_submit">Archivo</Label>
              <Input
                id="homework_file_submit"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos permitidos: PDF, DOCX (max. {uploadLimits.documents}MB)
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmittingHomeworkId(null);
                setSelectedFile(null);
              }}
              disabled={isSubmissionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitHomework}
              disabled={isSubmissionLoading || !selectedFile}
            >
              {isSubmissionLoading ? "Enviando..." : "Entregar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Dialog */}
      <Modal open={!!editingExam} onOpenChange={() => setEditingExam(null)}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Editar evaluacion</ModalTitle>
          </ModalHeader>

          {editData && (
            <div className="space-y-4">
              <div>
                <Label>Titulo</Label>
                <Input
                  value={editData.task}
                  onChange={(e) =>
                    setEditData({ ...editData, task: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Descripcion</Label>
                <Input
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={editData.due_date?.slice(0, 10)}
                  onChange={(e) =>
                    setEditData({ ...editData, due_date: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setEditingExam(null)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
}
