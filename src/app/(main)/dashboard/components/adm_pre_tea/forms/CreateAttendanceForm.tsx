"use client";

import { useState, useEffect } from "react";
import { AssistanceForm } from "@/utils/types";
import {
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Avatar,
  AvatarImage,
  AvatarFallback,
  ModalFooter,
} from "@/components/sacred";
import { toast } from "sonner";
import { PRESENCE_STATUS } from "@/types/assistance";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { FormProps, useCourses, useStudents, getCourseLabel } from "./shared";

export default function CreateAttendanceForm({ onBack, onClose }: FormProps) {
  const [formData, setFormData] = useState<AssistanceForm>({
    course_id: "",
    date: new Date().toISOString().split("T")[0],
    students: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();
  const { courses, isLoading: isLoadingCourses, load: loadCourses } = useCourses();
  const { students, isLoading: isLoadingStudents, load: loadStudents } = useStudents();

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (selectedCourseId) {
      loadStudents(parseInt(selectedCourseId), selectedYearId);
      setFormData((p) => ({ ...p, course_id: selectedCourseId, students: [] }));
    }
  }, [selectedCourseId, selectedYearId, loadStudents]);

  const handlePresenceChange = (studentId: number, presence: string) => {
    setFormData((p) => {
      const updated = [...p.students];
      const idx = updated.findIndex((s) => s.student_id === studentId);
      if (idx >= 0) {
        updated[idx] = { student_id: studentId, presence };
      } else {
        updated.push({ student_id: studentId, presence });
      }
      return { ...p, students: updated };
    });
  };

  const markAllPresent = () => {
    setFormData((p) => ({
      ...p,
      students: students.map((s) => ({ student_id: s.id, presence: PRESENCE_STATUS.PRESENT })),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.course_id || !formData.date || formData.students.length === 0) {
      toast.error("Selecciona un curso, fecha y registra al menos un estudiante");
      return;
    }

    const invalid = formData.students.filter((s) => !s.presence);
    if (invalid.length > 0) {
      toast.error("Todos los estudiantes deben tener un estado de asistencia");
      return;
    }

    setIsLoading(true);
    try {
      const promises = formData.students.map((student) =>
        fetch("/api/proxy/assistance", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student.student_id,
            presence: student.presence,
            date: formData.date,
          }),
        }).then((r) => {
          if (!r.ok) throw new Error(`Error para estudiante ${student.student_id}`);
          return r.json();
        })
      );

      await Promise.all(promises);
      toast.success(`Asistencia registrada para ${formData.students.length} estudiantes`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear asistencias");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {academicYears.length > 1 && (
        <div className="pb-2 border-b border-border">
          <Label className="text-xs text-text-secondary mb-2 block">Ciclo lectivo</Label>
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
            disabled={isLoadingYears || isLoading}
          />
        </div>
      )}

      <div>
        <Label>Curso *</Label>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={isLoadingCourses}>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingCourses ? "Cargando..." : "Selecciona un curso"} />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {getCourseLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Fecha *</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
        />
      </div>

      {selectedCourseId && students.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Asistencia</Label>
            <Button type="button" variant="secondary" size="sm" onClick={markAllPresent}>
              Marcar todos presentes
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {students.map((student) => {
              const presence = formData.students.find((s) => s.student_id === student.id)?.presence || "";
              return (
                <div key={student.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      {student.photo && <AvatarImage src={student.photo} />}
                      <AvatarFallback className="text-xs">{student.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-text-primary">{student.full_name}</span>
                  </div>
                  <Select value={presence} onValueChange={(v) => handlePresenceChange(student.id, v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PRESENCE_STATUS.PRESENT}>Presente</SelectItem>
                      <SelectItem value={PRESENCE_STATUS.ABSENT}>Ausente</SelectItem>
                      <SelectItem value={PRESENCE_STATUS.LATE}>Tarde</SelectItem>
                      <SelectItem value={PRESENCE_STATUS.JUSTIFIED}>Justificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-text-secondary">
            {formData.students.length} de {students.length} registrados
          </p>
        </div>
      )}

      {selectedCourseId && isLoadingStudents && (
        <p className="text-sm text-text-secondary text-center py-4">Cargando estudiantes...</p>
      )}

      {selectedCourseId && !isLoadingStudents && students.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-4">No se encontraron estudiantes</p>
      )}

      <ModalFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar asistencia"}
        </Button>
      </ModalFooter>
    </div>
  );
}
