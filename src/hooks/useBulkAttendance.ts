"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

type PresenceStatus = "present" | "absent" | "late" | "justified";

interface BulkAttendanceEntry {
  student_id: number;
  presence: PresenceStatus;
}

interface BulkAttendanceRequest {
  date: string;
  course_id: number;
  records: BulkAttendanceEntry[];
}

interface BulkAttendanceResponse {
  created: number;
  updated: number;
  skipped: number;
}

interface StudentAttendanceRow {
  student_id: number;
  student_name: string;
  presence: PresenceStatus;
}

export function useBulkAttendance() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceRows, setAttendanceRows] = useState<StudentAttendanceRow[]>([]);

  const initializeRows = useCallback((students: { id: number; full_name: string }[]) => {
    setAttendanceRows(
      students.map((s) => ({
        student_id: s.id,
        student_name: s.full_name,
        presence: "present" as PresenceStatus,
      }))
    );
  }, []);

  const updateRow = useCallback((studentId: number, presence: PresenceStatus) => {
    setAttendanceRows((prev) =>
      prev.map((row) =>
        row.student_id === studentId ? { ...row, presence } : row
      )
    );
  }, []);

  const setAllPresent = useCallback(() => {
    setAttendanceRows((prev) =>
      prev.map((row) => ({ ...row, presence: "present" as PresenceStatus }))
    );
  }, []);

  const submitBulkAttendance = useCallback(
    async (courseId: number, date: string): Promise<boolean> => {
      if (attendanceRows.length === 0) {
        toast.error("No hay registros para guardar");
        return false;
      }

      setIsSubmitting(true);

      try {
        const records: BulkAttendanceEntry[] = attendanceRows.map((row) => ({
          student_id: row.student_id,
          presence: row.presence,
        }));

        const request: BulkAttendanceRequest = {
          date,
          course_id: courseId,
          records,
        };

        const response = await axios.post<BulkAttendanceResponse>(
          "/api/proxy/assistance/bulk",
          request,
          { withCredentials: true }
        );

        const { created, updated, skipped } = response.data;

        if (skipped > 0) {
          toast.warning(`${created} creados, ${updated} actualizados, ${skipped} omitidos`);
        } else {
          toast.success(`Asistencia guardada: ${created} nuevos, ${updated} actualizados`);
        }

        return true;
      } catch (error) {
        console.error("Error submitting bulk attendance:", error);
        toast.error("Error al guardar la asistencia");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [attendanceRows]
  );

  const getStats = useCallback(() => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      justified: 0,
    };
    attendanceRows.forEach((row) => {
      stats[row.presence]++;
    });
    return stats;
  }, [attendanceRows]);

  return {
    attendanceRows,
    isSubmitting,
    initializeRows,
    updateRow,
    setAllPresent,
    submitBulkAttendance,
    getStats,
  };
}
