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
  const [orderBy, setOrderBy] = useState<string>("date_desc");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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

  // Eliminar filteredSubjects porque ya no se usa

  // Ordenar y filtrar calificaciones
  let subjectGrades = grades.filter((g) => g.subject_id === selectedSubject);
  if (typeFilter !== "all") {
    subjectGrades = subjectGrades.filter((g) => {
      const assessment = assessments.find((a) => a.id === g.assessment_id);
      return assessment && assessment.type === typeFilter;
    });
  }
  if (orderBy === "date_desc") {
    subjectGrades.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (orderBy === "date_asc") {
    subjectGrades.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } else if (orderBy === "grade_desc") {
    subjectGrades.sort((a, b) => Number(b.grade) - Number(a.grade));
  } else if (orderBy === "grade_asc") {
    subjectGrades.sort((a, b) => Number(a.grade) - Number(b.grade));
  }
  // Obtener tipos únicos de evaluación SOLO de las calificaciones filtradas
  const filteredAssessmentTypes = Array.from(
    new Set(
      grades
        .filter((g) => g.subject_id === selectedSubject)
        .map((g) => {
          const assessment = assessments.find((a) => a.id === g.assessment_id);
          return assessment ? assessment.type : null;
        })
        .filter(Boolean)
    )
  );

  // Mostrar solo las calificaciones filtradas y ordenadas
  const filteredGrades = subjectGrades;

  // Agrupar por assessment_id si existe, si no por descripción
  const gradesByAssessment: Record<
    string,
    { assessment?: Assessment; grades: Grade[] }
  > = {};
  filteredGrades.forEach((grade) => {
    const key = grade.assessment_id
      ? String(grade.assessment_id)
      : `desc-${grade.description}`;
    if (!gradesByAssessment[key]) {
      gradesByAssessment[key] = {
        assessment: grade.assessment_id
          ? assessments.find((a) => a.id === grade.assessment_id)
          : undefined,
        grades: [],
      };
    }
    gradesByAssessment[key].grades.push(grade);
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
      {/* Selectores de materia y ordenamiento */}
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
        {/* Nuevo select de ordenamiento */}
        <div className="w-full max-w-xs">
          <Select value={orderBy} onValueChange={setOrderBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">
                Fecha: más reciente primero
              </SelectItem>
              <SelectItem value="date_asc">
                Fecha: más antiguo primero
              </SelectItem>
              <SelectItem value="grade_desc">Nota: mayor a menor</SelectItem>
              <SelectItem value="grade_asc">Nota: menor a mayor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Nuevo select de tipo de evaluación */}
        <div className="w-full max-w-xs">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de evaluación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {filteredAssessmentTypes.map((type) => (
                <SelectItem key={type} value={type as string}>
                  {type === "selfassessable"
                    ? "Autoevaluable"
                    : type &&
                      (type as string).charAt(0).toUpperCase() +
                        (type as string).slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Calificaciones filtradas y ordenadas */}
      {Object.keys(gradesByAssessment).length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <EmptyStateSVG />
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
                    : assessment.type.charAt(0).toUpperCase() +
                      assessment.type.slice(1)}
                </span>
              )}
              {assessment?.due_date && (
                <span className="ml-2 text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-4" />
                  {new Date(assessment.due_date).toLocaleDateString("es-ES")}
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
                    className={getGradeColor(grade.grade, grade.grade_type)}
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
                      {new Date(grade.created_at).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
      {errorMsg && (
        <div className="text-red-500 text-center py-4">{errorMsg}</div>
      )}
    </div>
  );
}
