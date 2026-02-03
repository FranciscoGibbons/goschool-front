"use client";

import { useState, useEffect } from "react";
import { SubjectMessageForm } from "@/utils/types";
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
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "sonner";
import { cleanSubjectName } from "@/utils/subjectHelpers";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { FormProps, useSubjects } from "./shared";

export default function CreateSubjectMessageForm({ onBack, onClose }: FormProps) {
  const [formData, setFormData] = useState<SubjectMessageForm>({
    subject_id: "",
    title: "",
    content: "",
    type: "message",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();
  const { subjects, isLoading: isLoadingSubjects, load: loadSubjects } = useSubjects();

  useEffect(() => {
    loadSubjects(selectedYearId);
  }, [selectedYearId, loadSubjects]);

  const handleSubmit = async () => {
    if (!formData.subject_id || !formData.title || !formData.content) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("subject_id", formData.subject_id);
      fd.append("title", formData.title);
      fd.append("content", formData.content);
      fd.append("type", formData.type);
      if (formData.file) fd.append("file", formData.file);

      const res = await fetch("/api/proxy/subject-messages", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (res.ok) {
        toast.success("Mensaje de materia creado exitosamente");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Error al crear mensaje de materia");
      }
    } catch {
      toast.error("Error al crear mensaje de materia");
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
          value={formData.subject_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, subject_id: v }))}
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
        <Label>Titulo *</Label>
        <Input
          placeholder="Titulo del mensaje"
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
        />
      </div>

      <div>
        <Label>Tipo</Label>
        <Select
          value={formData.type}
          onValueChange={(v) => setFormData((p) => ({ ...p, type: v as SubjectMessageForm["type"] }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="message">Mensaje</SelectItem>
            <SelectItem value="file">Archivo</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Contenido *</Label>
        <RichTextEditor
          content={formData.content}
          onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
          placeholder="Contenido del mensaje"
        />
      </div>

      {formData.type === "file" && (
        <div>
          <Label>Archivo</Label>
          <Input
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

      <ModalFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear mensaje"}
        </Button>
      </ModalFooter>
    </div>
  );
}
