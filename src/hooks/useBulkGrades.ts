"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

interface BulkGradeEntry {
  student_id: number;
  grade: number | string;
  grade_type: "numerical" | "conceptual";
  description?: string;
}

interface BulkGradesRequest {
  subject_id: number;
  assessment_id?: number;
  grades: BulkGradeEntry[];
}

interface BulkGradesResponse {
  created: number;
  updated: number;
  failed: number;
}

interface StudentGradeRow {
  student_id: number;
  student_name: string;
  grade: string;
  grade_type: "numerical" | "conceptual";
  description: string;
  hasExistingGrade?: boolean;
}

export function useBulkGrades() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradeRows, setGradeRows] = useState<StudentGradeRow[]>([]);

  const initializeRows = useCallback((students: { id: number; full_name: string }[]) => {
    setGradeRows(
      students.map((s) => ({
        student_id: s.id,
        student_name: s.full_name,
        grade: "",
        grade_type: "numerical" as const,
        description: "",
        hasExistingGrade: false,
      }))
    );
  }, []);

  const updateRow = useCallback((studentId: number, field: keyof StudentGradeRow, value: string) => {
    setGradeRows((prev) =>
      prev.map((row) =>
        row.student_id === studentId ? { ...row, [field]: value } : row
      )
    );
  }, []);

  const setAllGradeType = useCallback((gradeType: "numerical" | "conceptual") => {
    setGradeRows((prev) =>
      prev.map((row) => ({ ...row, grade_type: gradeType }))
    );
  }, []);

  const submitBulkGrades = useCallback(
    async (subjectId: number, assessmentId?: number): Promise<boolean> => {
      // Filter rows with grades
      const validRows = gradeRows.filter((row) => row.grade !== "");

      if (validRows.length === 0) {
        toast.error("No hay notas para guardar");
        return false;
      }

      // Validate grades
      for (const row of validRows) {
        if (row.grade_type === "numerical") {
          const numGrade = parseFloat(row.grade);
          if (isNaN(numGrade) || numGrade < 1 || numGrade > 10) {
            toast.error(`Nota invalida para ${row.student_name}: debe ser entre 1 y 10`);
            return false;
          }
        } else {
          const validConcepts = ["e", "mb", "b", "s", "r", "i"];
          if (!validConcepts.includes(row.grade.toLowerCase())) {
            toast.error(`Nota invalida para ${row.student_name}: use E, MB, B, S, R o I`);
            return false;
          }
        }
      }

      setIsSubmitting(true);

      try {
        const grades: BulkGradeEntry[] = validRows.map((row) => {
          let gradeValue: number;
          if (row.grade_type === "numerical") {
            gradeValue = parseFloat(row.grade);
          } else {
            // Convert conceptual to numerical
            const conceptMap: Record<string, number> = {
              e: 10,
              mb: 9,
              b: 8,
              s: 7,
              r: 6,
              i: 4,
            };
            gradeValue = conceptMap[row.grade.toLowerCase()] || 0;
          }

          return {
            student_id: row.student_id,
            grade: gradeValue,
            grade_type: row.grade_type,
            description: row.description || undefined,
          };
        });

        const request: BulkGradesRequest = {
          subject_id: subjectId,
          assessment_id: assessmentId,
          grades,
        };

        const response = await axios.post<BulkGradesResponse>(
          "/api/proxy/grades/bulk",
          request,
          { withCredentials: true }
        );

        const { created, updated, failed } = response.data;

        if (failed > 0) {
          toast.warning(`${created} creadas, ${updated} actualizadas, ${failed} fallaron`);
        } else {
          toast.success(`${created} notas creadas, ${updated} actualizadas`);
        }

        return true;
      } catch (error) {
        console.error("Error submitting bulk grades:", error);
        toast.error("Error al guardar las notas");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [gradeRows]
  );

  const clearAllGrades = useCallback(() => {
    setGradeRows((prev) =>
      prev.map((row) => ({ ...row, grade: "", description: "" }))
    );
  }, []);

  const getFilledCount = useCallback(() => {
    return gradeRows.filter((row) => row.grade !== "").length;
  }, [gradeRows]);

  return {
    gradeRows,
    isSubmitting,
    initializeRows,
    updateRow,
    setAllGradeType,
    submitBulkGrades,
    clearAllGrades,
    getFilledCount,
  };
}
