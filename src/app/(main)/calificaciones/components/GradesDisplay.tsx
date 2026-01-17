"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BookOpen, GraduationCap, Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import userInfoStore from "@/store/userInfoStore";
import { cleanSubjectName } from "@/utils/subjectHelpers";
import { parseLocalDate } from "@/utils/dateHelpers";

const API_ENDPOINTS = {
  GRADES: "/api/proxy/grades",
  SUBJECTS: "/api/proxy/subjects",
  ASSESSMENTS: "/api/proxy/assessments",
};

interface Grade {
  id: number;
  subject_id: number;
  assessment_id: number | null;
  student_id: number;
  grade_type: "numerical" | "conceptual";
  description: string;
  grade: number | string;
  created_at: string;
}

interface Assessment {
  id: number;
  subject_id: number;
  task: string;
  due_date: string;
  type: string;
}

interface Subject {
  id: number;
  name: string;
  course_name?: string;
}

interface GradesDisplayProps {
  selectedStudentId?: number;
}

export default function GradesDisplay({ selectedStudentId }: GradesDisplayProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<string>("date_desc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editData, setEditData] = useState<Partial<Grade> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { userInfo } = userInfoStore();
  const currentStudentIdRef = useRef<number | undefined>(selectedStudentId);
  const canEdit = userInfo?.role === "admin" || userInfo?.role === "teacher" || userInfo?.role === "preceptor";

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SUBJECTS);
      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch {
      setSubjects([]);
    }
  }, []);

  useEffect(() => {
    currentStudentIdRef.current = selectedStudentId;
    setGrades([]);
    setAssessments([]);
    setSelectedSubject(null);

    const shouldFetch = userInfo?.role === "student" || selectedStudentId;

    if (shouldFetch) {
      const fetchAll = async () => {
        const requestStudentId = selectedStudentId;
        setIsLoading(true);

        try {
          await fetchSubjects();

          const gradesUrl = userInfo?.role === "student"
            ? API_ENDPOINTS.GRADES
            : `${API_ENDPOINTS.GRADES}?student_id=${selectedStudentId}`;

          const assessmentsUrl = userInfo?.role === "student"
            ? API_ENDPOINTS.ASSESSMENTS
            : `${API_ENDPOINTS.ASSESSMENTS}?student_id=${selectedStudentId}`;

          const [gradesRes, assessmentsRes] = await Promise.all([
            axios.get(gradesUrl),
            axios.get(assessmentsUrl),
          ]);

          if (currentStudentIdRef.current !== requestStudentId) return;

          const validGrades = Array.isArray(gradesRes.data)
            ? gradesRes.data.filter((g: Grade) =>
                userInfo?.role === "student" || g.student_id === selectedStudentId
              )
            : [];

          setGrades(validGrades);
          setAssessments(Array.isArray(assessmentsRes.data) ? assessmentsRes.data : []);
        } catch {
          if (currentStudentIdRef.current === requestStudentId) {
            toast.error("Error al cargar datos");
          }
        } finally {
          if (currentStudentIdRef.current === requestStudentId) {
            setIsLoading(false);
          }
        }
      };

      fetchAll();
    }
  }, [selectedStudentId, userInfo?.role, fetchSubjects]);

  useEffect(() => {
    if (selectedSubject === null && subjects.length > 0) {
      setSelectedSubject(subjects[0].id);
    }
  }, [selectedSubject, subjects]);

  // Filter and sort grades
  let subjectGrades = grades.filter((g) => g.subject_id === selectedSubject);

  if (typeFilter !== "all") {
    subjectGrades = subjectGrades.filter((g) => {
      const assessment = assessments.find((a) => a.id === g.assessment_id);
      return assessment && assessment.type === typeFilter;
    });
  }

  if (orderBy === "date_desc") {
    subjectGrades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (orderBy === "date_asc") {
    subjectGrades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (orderBy === "grade_desc") {
    subjectGrades.sort((a, b) => Number(b.grade) - Number(a.grade));
  } else if (orderBy === "grade_asc") {
    subjectGrades.sort((a, b) => Number(a.grade) - Number(b.grade));
  }

  const assessmentTypes = Array.from(
    new Set(
      grades
        .filter((g) => g.subject_id === selectedSubject)
        .map((g) => assessments.find((a) => a.id === g.assessment_id)?.type)
        .filter(Boolean)
    )
  );

  // Group grades by assessment
  const gradesByAssessment: Record<string, { assessment?: Assessment; grades: Grade[] }> = {};
  subjectGrades.forEach((grade) => {
    const key = grade.assessment_id ? String(grade.assessment_id) : `desc-${grade.description}`;
    if (!gradesByAssessment[key]) {
      gradesByAssessment[key] = {
        assessment: grade.assessment_id ? assessments.find((a) => a.id === grade.assessment_id) : undefined,
        grades: [],
      };
    }
    gradesByAssessment[key].grades.push(grade);
  });

  const getGradeDisplay = (grade: number | string, type: string) => {
    if (type === "conceptual") {
      const numGrade = typeof grade === "number" ? grade : parseFloat(grade as string);
      const labels: Record<number, string> = { 10: "E", 9: "MB", 8: "B", 7: "S", 6: "R", 4: "I" };
      return labels[numGrade] || grade.toString();
    }
    return grade.toString();
  };

  // Uses design token colors per DESIGN_CONTRACT.md
  const getGradeColor = (grade: number | string, type: string) => {
    if (type === "conceptual") return "bg-primary/10 text-primary border-primary/20";
    const numGrade = typeof grade === "number" ? grade : parseFloat(grade as string);
    if (numGrade >= 8) return "bg-success-muted text-success border-success/20";
    if (numGrade >= 6) return "bg-warning-muted text-warning border-warning/20";
    return "bg-error-muted text-error border-error/20";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      exam: "Examen",
      homework: "Tarea",
      project: "Proyecto",
      oral: "Oral",
      selfassessable: "Autoevaluable",
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    let gradeValue: string | number = grade.grade;
    if (grade.grade_type === "conceptual") {
      const conceptMap: Record<number, string> = { 10: "e", 9: "mb", 8: "b", 7: "s", 6: "r", 4: "i" };
      gradeValue = conceptMap[Number(grade.grade)] || grade.grade;
    }
    setEditData({ ...grade, grade: gradeValue });
  };

  const handleSave = async () => {
    if (!editingGrade || !editData) return;

    setIsSaving(true);
    try {
      let gradeValue: number | string = editData.grade!;

      if (editData.grade_type === "conceptual") {
        const conceptMap: Record<string, number> = { e: 10, mb: 9, b: 8, s: 7, r: 6, i: 4 };
        gradeValue = conceptMap[String(editData.grade).toLowerCase()] || Number(editData.grade);
      }

      const res = await fetch(`/api/proxy/grades/${editingGrade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          grade: gradeValue,
          grade_type: editData.grade_type,
          description: editData.description,
        }),
      });

      if (res.ok) {
        toast.success("Calificacion actualizada");
        setGrades((prev) =>
          prev.map((g) => (g.id === editingGrade.id ? { ...g, ...editData, grade: gradeValue } : g))
        );
        setEditingGrade(null);
        setEditData(null);
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de conexion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta calificacion?")) return;

    try {
      await fetch(`/api/proxy/grades/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Calificacion eliminada");
      setGrades((prev) => prev.filter((g) => g.id !== id));
    } catch {
      toast.error("Error al eliminar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando calificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={selectedSubject !== null ? String(selectedSubject) : ""}
          onValueChange={(v) => setSelectedSubject(Number(v))}
        >
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Materia" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{cleanSubjectName(s.name)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={orderBy} onValueChange={setOrderBy}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Mas reciente</SelectItem>
            <SelectItem value="date_asc">Mas antiguo</SelectItem>
            <SelectItem value="grade_desc">Mayor nota</SelectItem>
            <SelectItem value="grade_asc">Menor nota</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {assessmentTypes.map((type) => (
              <SelectItem key={type} value={type as string}>
                {getTypeLabel(type as string)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grades list */}
      {Object.keys(gradesByAssessment).length === 0 ? (
        <div className="empty-state">
          <GraduationCap className="empty-state-icon" />
          <p className="empty-state-title">Sin calificaciones</p>
          <p className="empty-state-text">No hay notas registradas para esta materia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(gradesByAssessment).map(([key, { assessment, grades }]) => (
            <div key={key} className="minimal-card">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  {assessment?.task || grades[0]?.description || "Sin descripcion"}
                </span>
                {assessment && (
                  <span className="status-badge">
                    {getTypeLabel(assessment.type)}
                  </span>
                )}
                {assessment?.due_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                    <Calendar className="h-3 w-3" />
                    {parseLocalDate(assessment.due_date).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex flex-col items-center gap-1 min-w-[80px] p-2 rounded-md bg-muted/30 group relative"
                  >
                    <span
                      className={cn(
                        "text-lg font-semibold px-3 py-1 rounded border",
                        getGradeColor(grade.grade, grade.grade_type)
                      )}
                    >
                      {getGradeDisplay(grade.grade, grade.grade_type)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {grade.grade_type === "conceptual" ? "Conceptual" : "Numerica"}
                    </span>
                    {grade.created_at && (
                      <span className="text-[10px] text-muted-foreground">
                        {parseLocalDate(grade.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}

                    {canEdit && (
                      <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                        <button
                          onClick={() => handleEdit(grade)}
                          className="p-1 bg-background rounded shadow-sm hover:bg-accent"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="p-1 bg-background rounded shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingGrade} onOpenChange={() => { setEditingGrade(null); setEditData(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar calificacion</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Nota</Label>
              {editData?.grade_type === "conceptual" ? (
                <Select
                  value={String(editData?.grade || "")}
                  onValueChange={(v) => setEditData((prev) => ({ ...prev!, grade: v }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecciona nota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e">E (Excelente)</SelectItem>
                    <SelectItem value="mb">MB (Muy Bueno)</SelectItem>
                    <SelectItem value="b">B (Bueno)</SelectItem>
                    <SelectItem value="s">S (Satisfactorio)</SelectItem>
                    <SelectItem value="r">R (Regular)</SelectItem>
                    <SelectItem value="i">I (Insuficiente)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={editData?.grade || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev!, grade: e.target.value }))}
                  className="h-10"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo</Label>
              <Select
                value={editData?.grade_type || "numerical"}
                onValueChange={(v) =>
                  setEditData((prev) => ({ ...prev!, grade_type: v as "numerical" | "conceptual" }))
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numerical">Numerica</SelectItem>
                  <SelectItem value="conceptual">Conceptual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Descripcion</Label>
              <Input
                value={editData?.description || ""}
                onChange={(e) => setEditData((prev) => ({ ...prev!, description: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => { setEditingGrade(null); setEditData(null); }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
