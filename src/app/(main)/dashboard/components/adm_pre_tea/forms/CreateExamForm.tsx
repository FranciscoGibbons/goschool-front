"use client";

import { useState, useEffect } from "react";
import { ExamForm } from "@/utils/types";
import {
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ModalFooter,
} from "@/components/sacred";
import { toast } from "sonner";
import { cleanSubjectName } from "@/utils/subjectHelpers";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { FormProps, useSubjects } from "./shared";

export default function CreateExamForm({ onBack, onClose }: FormProps) {
  // Initialize with selfassessable fields so they're always available when switching types
  const [formData, setFormData] = useState({
    subject: "",
    task: "",
    due_date: "",
    type: "exam" as ExamForm["type"],
    file: undefined as File | undefined,
    questions: Array(10).fill("") as string[],
    correct: Array(10).fill("") as string[],
    incorrect1: Array(10).fill("") as string[],
    incorrect2: Array(10).fill("") as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();
  const { subjects, isLoading: isLoadingSubjects, load: loadSubjects } = useSubjects();

  useEffect(() => {
    loadSubjects(selectedYearId);
  }, [selectedYearId, loadSubjects]);

  const isSelfAssessable = formData.type === "selfassessable";

  const isQuestionComplete = (index: number) => {
    if (!isSelfAssessable) return false;
    return (
      formData.questions[index] &&
      formData.correct[index] &&
      formData.incorrect1[index] &&
      formData.incorrect2[index]
    );
  };

  const getCompletedCount = () => {
    if (!isSelfAssessable) return 0;
    return formData.questions.filter((_, i) => isQuestionComplete(i)).length;
  };

  const handleArrayChange = (
    field: "questions" | "correct" | "incorrect1" | "incorrect2",
    index: number,
    value: string
  ) => {
    if (isSelfAssessable) {
      setFormData({
        ...formData,
        [field]: formData[field].map((item, i) => (i === index ? value : item)),
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.task || !formData.due_date) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsLoading(true);
    try {
      let payload: unknown;
      let url: string;

      if (isSelfAssessable) {
        if (getCompletedCount() < 3) {
          toast.error(`Completa al menos 3 preguntas (${getCompletedCount()}/3)`);
          setIsLoading(false);
          return;
        }

        const completed = formData.questions
          .map((_, i) => i)
          .filter((i) => isQuestionComplete(i));

        payload = {
          newtask: {
            subject: Number(formData.subject),
            task: formData.task,
            due_date: formData.due_date,
            type: "selfassessable",
          },
          newselfassessable: {
            questions: completed.map((i) => formData.questions[i]),
            correct: completed.map((i) => formData.correct[i]),
            incorrect1: completed.map((i) => formData.incorrect1[i]),
            incorrect2: completed.map((i) => formData.incorrect2[i]),
          },
        };
        url = "/api/proxy/assessments";
      } else if (formData.file && formData.type === "homework") {
        const fd = new FormData();
        fd.append("subject", String(Number(formData.subject)));
        fd.append("task", formData.task);
        fd.append("due_date", formData.due_date);
        fd.append("type", formData.type);
        fd.append("file", formData.file);

        const res = await fetch("/api/proxy/assessments/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (res.ok) {
          toast.success("Examen creado exitosamente");
          onClose();
        } else {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error || "Error al crear examen");
        }
        setIsLoading(false);
        return;
      } else {
        payload = {
          newtask: {
            subject: Number(formData.subject),
            task: formData.task,
            due_date: formData.due_date,
            type: formData.type,
          },
        };
        url = "/api/proxy/assessments";
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Examen creado exitosamente");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Error al crear examen");
      }
    } catch {
      toast.error("Error al crear examen");
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
        <Label htmlFor="exam-subject">Materia *</Label>
        <Select
          value={formData.subject}
          onValueChange={(v) => setFormData((p) => ({ ...p, subject: v }))}
          disabled={isLoadingSubjects}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingSubjects ? "Cargando materias..." : "Selecciona una materia"} />
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
        <Label htmlFor="exam-task">Nombre de la evaluacion *</Label>
        <Input
          id="exam-task"
          placeholder="Nombre de la evaluacion"
          value={formData.task}
          onChange={(e) => setFormData((p) => ({ ...p, task: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="exam-date">Fecha *</Label>
        <Input
          id="exam-date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData((p) => ({ ...p, due_date: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="exam-type">Tipo *</Label>
        <Select
          value={formData.type}
          onValueChange={(v) => setFormData((p) => ({ ...p, type: v as ExamForm["type"] }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de evaluacion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="exam">Examen</SelectItem>
            <SelectItem value="homework">Tarea</SelectItem>
            <SelectItem value="project">Proyecto</SelectItem>
            <SelectItem value="oral">Oral</SelectItem>
            <SelectItem value="remedial">Recuperatorio</SelectItem>
            <SelectItem value="selfassessable">Autoevaluable (quiz)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === "homework" && (
        <div>
          <Label htmlFor="hw-file">Archivo adjunto (opcional)</Label>
          <Input
            id="hw-file"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFormData((p) => ({ ...p, file: file || undefined }));
            }}
          />
          <p className="text-xs text-text-secondary mt-1">PDF o DOCX (max. 10MB)</p>
        </div>
      )}

      {isSelfAssessable && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-text-primary">
              Pregunta {currentQuestion + 1} de 10
            </p>
            <p className="text-xs text-text-secondary">
              Completas: {getCompletedCount()}/3 minimo
            </p>
          </div>

          <div className="space-y-3 p-4 border border-border rounded-lg bg-surface-muted">
            <div>
              <Label>Pregunta</Label>
              <Input
                placeholder="Escribe la pregunta"
                value={formData.questions[currentQuestion]}
                onChange={(e) => handleArrayChange("questions", currentQuestion, e.target.value)}
              />
            </div>
            <div>
              <Label>Respuesta correcta</Label>
              <Input
                placeholder="Respuesta correcta"
                value={formData.correct[currentQuestion]}
                onChange={(e) => handleArrayChange("correct", currentQuestion, e.target.value)}
              />
            </div>
            <div>
              <Label>Opcion incorrecta 1</Label>
              <Input
                placeholder="Primera opcion incorrecta"
                value={formData.incorrect1[currentQuestion]}
                onChange={(e) => handleArrayChange("incorrect1", currentQuestion, e.target.value)}
              />
            </div>
            <div>
              <Label>Opcion incorrecta 2</Label>
              <Input
                placeholder="Segunda opcion incorrecta"
                value={formData.incorrect2[currentQuestion]}
                onChange={(e) => handleArrayChange("incorrect2", currentQuestion, e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" size="sm" onClick={() => setCurrentQuestion((c) => Math.max(0, c - 1))} disabled={currentQuestion === 0}>
              Anterior
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCurrentQuestion((c) => Math.min(9, c + 1))} disabled={currentQuestion === 9}>
              Siguiente
            </Button>
          </div>

          <div className="flex justify-center gap-1.5 flex-wrap">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                    currentQuestion === i
                      ? "bg-primary text-primary-foreground"
                      : isQuestionComplete(i)
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-surface-muted text-text-secondary border border-border"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
          </div>
        </div>
      )}

      <ModalFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (isSelfAssessable && getCompletedCount() < 3)}
        >
          {isLoading ? "Creando..." : "Crear examen"}
        </Button>
      </ModalFooter>
    </div>
  );
}
