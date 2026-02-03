"use client";

import { useState, useEffect, useRef } from "react";
import { GradeForm } from "@/utils/types";
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
import { cleanSubjectName } from "@/utils/subjectHelpers";
import { fetchAllPages } from "@/utils/fetchAllPages";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { FormProps, useSubjects, useStudents, Assessment } from "./shared";

export default function CreateGradeForm({ onBack, onClose }: FormProps) {
  const [formData, setFormData] = useState<GradeForm>({
    subject: "",
    assessment_id: "",
    student_id: "",
    grade_type: "numerical",
    description: "",
    grade: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);

  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();
  const { subjects, isLoading: isLoadingSubjects, load: loadSubjects } = useSubjects();
  const { students, isLoading: isLoadingStudents, load: loadStudents } = useStudents();

  const prevSubjectRef = useRef<string | null>(null);

  useEffect(() => {
    loadSubjects(selectedYearId);
    setFormData({
      subject: "",
      assessment_id: "",
      student_id: "",
      grade_type: "numerical",
      description: "",
      grade: "",
    });
  }, [selectedYearId, loadSubjects]);

  // Load assessments and students when subject changes
  useEffect(() => {
    if (formData.subject && formData.subject !== prevSubjectRef.current) {
      prevSubjectRef.current = formData.subject;

      // Load assessments
      setIsLoadingAssessments(true);
      const params: Record<string, string | number> = { subject_id: formData.subject };
      if (selectedYearId) params.academic_year_id = selectedYearId;
      fetchAllPages<Assessment>("/api/proxy/assessments/", params)
        .then(setAssessments)
        .catch(() => {
          toast.error("Error al cargar evaluaciones");
          setAssessments([]);
        })
        .finally(() => setIsLoadingAssessments(false));

      // Load students for the subject's course
      const subj = subjects.find((s) => s.id.toString() === formData.subject);
      if (subj) loadStudents(subj.course_id, selectedYearId);

      setFormData((p) => ({ ...p, assessment_id: "", student_id: "" }));
    }
  }, [formData.subject, subjects, selectedYearId, loadStudents]);

  const handleSubmit = async () => {
    if (!formData.subject || !formData.student_id || !formData.grade || !formData.description) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Validate grade
    if (formData.grade_type === "numerical") {
      const n = Number(formData.grade);
      if (isNaN(n) || n < 1 || n > 10) {
        toast.error("La nota debe ser un numero entre 1 y 10");
        return;
      }
    }
    if (formData.grade_type === "percentage") {
      const n = Number(formData.grade);
      if (isNaN(n) || n < 0 || n > 100) {
        toast.error("El porcentaje debe ser entre 0 y 100");
        return;
      }
    }

    let gradeValue: number;
    if (formData.grade_type === "conceptual") {
      const map: Record<string, number> = { e: 10, mb: 9, b: 8, s: 7, r: 6, i: 4 };
      const v = map[formData.grade.toLowerCase()];
      if (v === undefined) {
        toast.error("Nota conceptual invalida");
        return;
      }
      gradeValue = v;
    } else {
      gradeValue = Number(formData.grade);
    }

    setIsLoading(true);
    try {
      const payload = {
        subject: Number(formData.subject),
        assessment_id: formData.assessment_id ? Number(formData.assessment_id) : null,
        student_id: Number(formData.student_id),
        grade_type: formData.grade_type === "percentage" ? "numerical" : formData.grade_type,
        description: formData.description,
        grade: gradeValue,
      };

      const res = await fetch("/api/proxy/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Calificacion cargada exitosamente");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast.error("Ya existe una calificacion para este assessment y estudiante");
        } else {
          toast.error(data.error || "Error al cargar calificacion");
        }
      }
    } catch {
      toast.error("Error al cargar calificacion");
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
        <Label>Materia *</Label>
        <Select
          value={formData.subject}
          onValueChange={(v) => setFormData((p) => ({ ...p, subject: v }))}
          disabled={isLoadingSubjects}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingSubjects ? "Cargando..." : "Selecciona una materia"} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {cleanSubjectName(s.name)}{s.course_name && ` - ${s.course_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Evaluacion</Label>
        <Select
          value={formData.assessment_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, assessment_id: v }))}
          disabled={isLoadingAssessments || !formData.subject}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !formData.subject
                  ? "Primero selecciona una materia"
                  : isLoadingAssessments
                  ? "Cargando..."
                  : "Selecciona una evaluacion"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {assessments.map((a) => (
              <SelectItem key={a.id} value={a.id.toString()}>
                {a.task} — {a.type} ({new Date(a.due_date).toLocaleDateString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Estudiante *</Label>
        <Select
          value={formData.student_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, student_id: v }))}
          disabled={isLoadingStudents || !formData.subject}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !formData.subject
                  ? "Primero selecciona una materia"
                  : isLoadingStudents
                  ? "Cargando..."
                  : "Selecciona un estudiante"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {s.photo && <AvatarImage src={s.photo} />}
                    <AvatarFallback className="text-xs">{s.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{s.full_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tipo de nota *</Label>
        <Select
          value={formData.grade_type}
          onValueChange={(v) => setFormData((p) => ({ ...p, grade_type: v as GradeForm["grade_type"], grade: "" }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="numerical">Numerica (1-10)</SelectItem>
            <SelectItem value="conceptual">Conceptual (E, MB, B, S, R, I)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Descripcion *</Label>
        <Input
          placeholder="Descripcion de la nota"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      <div>
        <Label>Nota *</Label>
        {formData.grade_type === "conceptual" ? (
          <Select
            value={formData.grade}
            onValueChange={(v) => setFormData((p) => ({ ...p, grade: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nota" />
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
            placeholder={formData.grade_type === "percentage" ? "0-100" : "1-10"}
            value={formData.grade}
            onChange={(e) => setFormData((p) => ({ ...p, grade: e.target.value }))}
          />
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Cargando..." : "Cargar calificacion"}
        </Button>
      </ModalFooter>
    </div>
  );
}
