"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Save, X, Users, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBulkGrades } from "@/hooks/useBulkGrades";
import { cleanSubjectName } from "@/utils/subjectHelpers";

interface Subject {
  id: number;
  name: string;
  course_id: number;
  course_name?: string;
}

interface Assessment {
  id: number;
  subject_id: number;
  task: string;
  due_date: string;
  type: string;
}

interface Student {
  id: number;
  full_name: string;
}

interface Course {
  id: number;
  name: string;
}

interface BulkGradeEntryProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function BulkGradeEntry({ onCancel, onSuccess }: BulkGradeEntryProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalGradeType, setGlobalGradeType] = useState<"numerical" | "conceptual">("numerical");

  const {
    gradeRows,
    isSubmitting,
    initializeRows,
    updateRow,
    setAllGradeType,
    submitBulkGrades,
    clearAllGrades,
    getFilledCount,
  } = useBulkGrades();

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/proxy/courses", { withCredentials: true });
        const data = res.data?.data || res.data || [];
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Error al cargar cursos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch subjects when course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setSubjects([]);
      setSelectedSubjectId(null);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`/api/proxy/subjects?course_id=${selectedCourseId}`, {
          withCredentials: true,
        });
        const data = res.data?.data || res.data || [];
        setSubjects(data);
        setSelectedSubjectId(null);
        setSelectedAssessmentId(null);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [selectedCourseId]);

  // Fetch assessments when subject changes
  useEffect(() => {
    if (!selectedSubjectId) {
      setAssessments([]);
      setSelectedAssessmentId(null);
      return;
    }

    const fetchAssessments = async () => {
      try {
        const res = await axios.get(`/api/proxy/assessments?subject_id=${selectedSubjectId}`, {
          withCredentials: true,
        });
        const data = res.data?.data || res.data || [];
        setAssessments(data);
        setSelectedAssessmentId(null);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };
    fetchAssessments();
  }, [selectedSubjectId]);

  // Fetch students when course is selected
  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([]);
      initializeRows([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`/api/proxy/students?course_id=${selectedCourseId}`, {
          withCredentials: true,
        });
        const data = res.data?.data || res.data || [];
        setStudents(data);
        initializeRows(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [selectedCourseId, initializeRows]);

  const handleGlobalGradeTypeChange = useCallback(
    (value: "numerical" | "conceptual") => {
      setGlobalGradeType(value);
      setAllGradeType(value);
    },
    [setAllGradeType]
  );

  const handleSubmit = async () => {
    if (!selectedSubjectId) {
      toast.error("Selecciona una materia");
      return;
    }

    const success = await submitBulkGrades(
      selectedSubjectId,
      selectedAssessmentId || undefined
    );

    if (success) {
      onSuccess?.();
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Carga Masiva de Notas
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select
                value={selectedCourseId?.toString() || ""}
                onValueChange={(v) => setSelectedCourseId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Materia</label>
              <Select
                value={selectedSubjectId?.toString() || ""}
                onValueChange={(v) => setSelectedSubjectId(Number(v))}
                disabled={!selectedCourseId || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5" />
                        {cleanSubjectName(subject.name)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Evaluacion (opcional)</label>
              <Select
                value={selectedAssessmentId?.toString() || "none"}
                onValueChange={(v) => setSelectedAssessmentId(v === "none" ? null : Number(v))}
                disabled={!selectedSubjectId || assessments.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin evaluacion especifica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin evaluacion especifica</SelectItem>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        {assessment.task}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info badges */}
          {selectedCourse && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selectedCourse.name}</Badge>
              {selectedSubject && (
                <Badge variant="secondary">{cleanSubjectName(selectedSubject.name)}</Badge>
              )}
              {selectedAssessment && (
                <Badge variant="default">{selectedAssessment.task}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Entry Table */}
      {selectedSubjectId && students.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {students.length} estudiantes
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm">Tipo para todos:</label>
                  <Select
                    value={globalGradeType}
                    onValueChange={(v) => handleGlobalGradeTypeChange(v as "numerical" | "conceptual")}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numerical">Numerica</SelectItem>
                      <SelectItem value="conceptual">Conceptual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={clearAllGrades}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Alumno</TableHead>
                    <TableHead className="w-[20%]">Nota</TableHead>
                    <TableHead className="w-[15%]">Tipo</TableHead>
                    <TableHead className="w-[25%]">Observacion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeRows.map((row) => (
                    <TableRow key={row.student_id}>
                      <TableCell className="font-medium">
                        {row.student_name}
                      </TableCell>
                      <TableCell>
                        {row.grade_type === "numerical" ? (
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            placeholder="1-10"
                            value={row.grade}
                            onChange={(e) =>
                              updateRow(row.student_id, "grade", e.target.value)
                            }
                            className="h-8 w-20"
                          />
                        ) : (
                          <Select
                            value={row.grade.toLowerCase() || ""}
                            onValueChange={(v) => updateRow(row.student_id, "grade", v)}
                          >
                            <SelectTrigger className="h-8 w-20">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="e">E</SelectItem>
                              <SelectItem value="mb">MB</SelectItem>
                              <SelectItem value="b">B</SelectItem>
                              <SelectItem value="s">S</SelectItem>
                              <SelectItem value="r">R</SelectItem>
                              <SelectItem value="i">I</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.grade_type}
                          onValueChange={(v) =>
                            updateRow(row.student_id, "grade_type", v as "numerical" | "conceptual")
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="numerical">Numerica</SelectItem>
                            <SelectItem value="conceptual">Conceptual</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Opcional"
                          value={row.description}
                          onChange={(e) =>
                            updateRow(row.student_id, "description", e.target.value)
                          }
                          className="h-8"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {getFilledCount()} de {students.length} notas completadas
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || getFilledCount() === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : "Guardar Todas las Notas"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {selectedCourseId && students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay estudiantes en este curso</p>
          </CardContent>
        </Card>
      )}

      {!selectedCourseId && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Selecciona un curso y materia para cargar notas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
