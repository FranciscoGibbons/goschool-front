"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import useSubjectsStore from "@/store/subjectsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AcademicCapIcon, CalendarIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";

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

export default function GradesDisplay() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const subjectsStore = useSubjectsStore();
  const { subjects, fetchSubjects } = subjectsStore;

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        if (subjects.length === 0) await fetchSubjects();
        const [gradesRes, assessmentsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/grades/", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8080/api/v1/assessments/", {
            withCredentials: true,
          }),
        ]);
        setGrades(gradesRes.data || []);
        setAssessments(assessmentsRes.data || []);
        setErrorMsg("");
      } catch {
        setGrades([]);
        setAssessments([]);
        setErrorMsg("Error al cargar calificaciones.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects.length]);

  // Seleccionar automáticamente la primera materia al cargar
  useEffect(() => {
    if (subjects.length > 0 && selectedSubject == null) {
      setSelectedSubject(subjects[0].id);
    }
  }, [subjects, selectedSubject]);

  // Filtrar materias según selección (solo una materia a la vez)
  const filteredSubjects = selectedSubject
    ? subjects.filter((s) => s.id === selectedSubject)
    : [];

  // Agrupar notas por materia
  const subjectsWithGrades = filteredSubjects.map((subject) => {
    const subjectGrades = grades.filter((g) => g.subject_id === subject.id);
    const subjectAssessments = assessments.filter(
      (a) => a.subject_id === subject.id
    );
    // Agrupar por assessment_id si existe, si no por descripción
    const gradesByAssessment: Record<
      string,
      { assessment?: Assessment; grades: Grade[] }
    > = {};
    subjectGrades.forEach((grade) => {
      const key = grade.assessment_id
        ? String(grade.assessment_id)
        : `desc-${grade.description}`;
      if (!gradesByAssessment[key]) {
        gradesByAssessment[key] = {
          assessment: grade.assessment_id
            ? subjectAssessments.find((a) => a.id === grade.assessment_id)
            : undefined,
          grades: [],
        };
      }
      gradesByAssessment[key].grades.push(grade);
    });
    // Calcular promedio numérico
    const numericalGrades = subjectGrades.filter(
      (g) => g.grade_type === "numerical"
    );
    const average = numericalGrades.length
      ? Math.round(
          (numericalGrades.reduce((sum, g) => sum + Number(g.grade), 0) /
            numericalGrades.length) *
            100
        ) / 100
      : undefined;
    return {
      subject,
      gradesByAssessment,
      average,
    };
  });

  const getGradeColor = (grade: number | string, type: string) => {
    if (type === "conceptual") return "bg-blue-100 text-blue-800";
    const numGrade =
      typeof grade === "number" ? grade : parseFloat(grade as string);
    if (numGrade >= 8) return "bg-green-100 text-green-800";
    if (numGrade >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getAssessmentTypeColor = (type: string) =>
    type === "selfassessable"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  if (isLoading) {
    return <div className="text-center py-8">Cargando calificaciones...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Selector de materia */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full max-w-xs">
          <Select
            value={selectedSubject?.toString() || ""}
            onValueChange={(value) => setSelectedSubject(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una materia" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Calificaciones por materia */}
      {subjectsWithGrades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <EmptyStateSVG />
        </div>
      )}
      {subjectsWithGrades.map(({ subject, gradesByAssessment, average }) => (
        <div key={subject.id} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            {/* <BookOpenIcon className="size-6 text-primary" /> */}
            {/* <h2 className="text-2xl font-bold text-foreground">{subject.name}</h2> */}
            {/* Eliminado el texto de la materia */}
            {average !== undefined && (
              <span className="ml-4 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                Promedio: {average}
              </span>
            )}
          </div>
          {/* Notas agrupadas por evaluación o descripción */}
          <div className="space-y-4">
            {Object.entries(gradesByAssessment).length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <EmptyStateSVG className="w-96 h-72 mb-4 opacity-80" />
                <span className="text-muted-foreground text-lg opacity-60">
                  No hay calificaciones registradas
                </span>
              </div>
            )}
            {Object.entries(gradesByAssessment).map(
              ([key, { assessment, grades }]) => (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-card shadow-sm px-6 py-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AcademicCapIcon className="size-5 text-primary" />
                    <span className="font-semibold text-base text-foreground">
                      {assessment
                        ? assessment.task
                        : grades[0]?.description || "Sin descripción"}
                    </span>
                    {assessment && (
                      <span
                        className={clsx(
                          "ml-2 px-2 py-0.5 rounded text-xs font-semibold",
                          getAssessmentTypeColor(assessment.type)
                        )}
                      >
                        {assessment.type === "selfassessable"
                          ? "Autoevaluable"
                          : "Oral"}
                      </span>
                    )}
                    {assessment?.due_date && (
                      <span className="ml-2 text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="size-4" />
                        {new Date(assessment.due_date).toLocaleDateString(
                          "es-ES"
                        )}
                      </span>
                    )}
                  </div>
                  {/* Lista de notas */}
                  <div className="flex flex-wrap gap-4">
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex flex-col items-center gap-1 min-w-[90px]"
                      >
                        <Badge
                          className={getGradeColor(
                            grade.grade,
                            grade.grade_type
                          )}
                        >
                          {grade.grade}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {grade.grade_type === "conceptual"
                            ? "Conceptual"
                            : "Numérica"}
                        </span>
                        {grade.created_at && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(grade.created_at).toLocaleDateString(
                              "es-ES"
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
      {errorMsg && (
        <div className="text-red-500 text-center py-4">{errorMsg}</div>
      )}
    </div>
  );
}
