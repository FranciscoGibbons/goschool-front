"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpenIcon,
  AcademicCapIcon,
  StarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface Subject {
  id: number;
  name: string;
}

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

interface SubjectWithGrades {
  subject: Subject;
  grades: Grade[];
  average?: number;
}

export default function GradesDisplay() {
  const [subjectsWithGrades, setSubjectsWithGrades] = useState<
    SubjectWithGrades[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener materias
        const subjectsRes = await axios.get(
          "http://localhost:8080/api/v1/subjetcs/",
          {
            withCredentials: true,
          }
        );

        // Obtener notas
        const gradesRes = await axios.get(
          "http://localhost:8080/api/v1/grades/",
          {
            withCredentials: true,
          }
        );

        const subjects: Subject[] = subjectsRes.data || [];
        const grades: Grade[] = gradesRes.data || [];

        // Combinar materias con sus notas
        const subjectsWithGradesData: SubjectWithGrades[] = subjects.map(
          (subject) => {
            const subjectGrades = grades.filter(
              (grade) => grade.subject_id === subject.id
            );
            const numericalGrades = subjectGrades
              .filter((grade) => grade.grade_type === "numerical")
              .map((grade) =>
                typeof grade.grade === "number"
                  ? grade.grade
                  : parseFloat(grade.grade as string)
              )
              .filter((grade) => !isNaN(grade));

            const average =
              numericalGrades.length > 0
                ? numericalGrades.reduce((sum, grade) => sum + grade, 0) /
                  numericalGrades.length
                : undefined;

            return {
              subject,
              grades: subjectGrades,
              average: average ? Math.round(average * 10) / 10 : undefined,
            };
          }
        );

        setSubjectsWithGrades(subjectsWithGradesData);
        setErrorMsg("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubjectsWithGrades([]);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setErrorMsg("No autorizado. Inicia sesión nuevamente.");
          } else {
            setErrorMsg("Error al cargar calificaciones.");
          }
        } else {
          setErrorMsg("Error desconocido.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGradeColor = (grade: number | string, type: string) => {
    if (type === "conceptual") {
      return "bg-blue-100 text-blue-800";
    }

    const numGrade =
      typeof grade === "number" ? grade : parseFloat(grade as string);
    if (numGrade >= 8) return "bg-green-100 text-green-800";
    if (numGrade >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getProgressValue = (average?: number) => {
    if (!average) return 0;
    return (average / 10) * 100;
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando calificaciones...</div>;
  }

  // Debug: mostrar materias y notas
  console.log("subjectsWithGrades", subjectsWithGrades);

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="text-red-500 text-center py-4">{errorMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsWithGrades.map((subjectData) => (
          <Card
            key={subjectData.subject.id}
            className="hover:shadow-lg transition-shadow border-2 border-primary/20 bg-white/80 dark:bg-zinc-900/80"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpenIcon className="size-5" />
                <span>{subjectData.subject.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectData.grades.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-primary/80">
                    Notas:
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                    {subjectData.grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-2 bg-muted rounded border border-primary/10"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {grade.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(grade.created_at).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                        <Badge
                          className={getGradeColor(
                            grade.grade,
                            grade.grade_type
                          )}
                        >
                          {grade.grade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    No hay notas registradas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {subjectsWithGrades.length === 0 && !errorMsg && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay materias disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
