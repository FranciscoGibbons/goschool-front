"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Save, X, Users, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBulkAttendance } from "@/hooks/useBulkAttendance";

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  full_name: string;
}

interface BulkAttendanceProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const PRESENCE_OPTIONS = [
  { value: "present", label: "Presente", color: "bg-success", dotColor: "bg-success" },
  { value: "absent", label: "Ausente", color: "bg-error", dotColor: "bg-error" },
  { value: "late", label: "Tardanza", color: "bg-warning", dotColor: "bg-warning" },
  { value: "excused", label: "Justificado", color: "bg-primary", dotColor: "bg-primary" },
] as const;

export default function BulkAttendance({ onCancel, onSuccess }: BulkAttendanceProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    attendanceRows,
    isSubmitting,
    initializeRows,
    updateRow,
    setAllPresent,
    submitBulkAttendance,
    getStats,
  } = useBulkAttendance();

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

  // Fetch students when course changes
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

  const handleSubmit = async () => {
    if (!selectedCourseId) {
      toast.error("Selecciona un curso");
      return;
    }

    if (!selectedDate) {
      toast.error("Selecciona una fecha");
      return;
    }

    const success = await submitBulkAttendance(selectedCourseId, selectedDate);

    if (success) {
      onSuccess?.();
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const stats = getStats();

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
              Asistencia por Lista de Clase
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Info badges */}
          {selectedCourse && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selectedCourse.name}</Badge>
              <Badge variant="secondary">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance List */}
      {selectedCourseId && students.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-base">
                {students.length} estudiantes
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={setAllPresent}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar Todos Presentes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceRows.map((row) => (
                <div
                  key={row.student_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        PRESENCE_OPTIONS.find((o) => o.value === row.presence)?.dotColor ||
                        "bg-muted"
                      }`}
                    />
                    <span className="font-medium">{row.student_name}</span>
                  </div>
                  <Select
                    value={row.presence}
                    onValueChange={(v) =>
                      updateRow(row.student_id, v as "present" | "absent" | "late" | "excused")
                    }
                  >
                    <SelectTrigger className="w-36 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${option.dotColor}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>{stats.present} Presentes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span>{stats.absent} Ausentes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span>{stats.late} Tardanzas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{stats.justified} Justificados</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end mt-6 pt-4 border-t gap-2">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Guardando..." : "Guardar Asistencia"}
              </Button>
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
            <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Selecciona un curso para tomar asistencia
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
