"use client";

import { useState, useEffect } from "react";
import { MessageForm } from "@/utils/types";
import {
  Button,
  Label,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  ModalFooter,
} from "@/components/sacred";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "sonner";
import { FormProps, useCourses, getCourseLabel } from "./shared";

export default function CreateMessageForm({ onBack, onClose }: FormProps) {
  const [formData, setFormData] = useState<MessageForm>({
    title: "",
    message: "",
    courses: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { courses, isLoading: isLoadingCourses, load: loadCourses } = useCourses();

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.message || formData.courses.length === 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        courses: formData.courses.map(String).join(","),
      };

      const res = await fetch("/api/proxy/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Mensaje creado exitosamente");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Error al crear mensaje");
      }
    } catch {
      toast.error("Error al crear mensaje");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="msg-title">Titulo *</Label>
        <Input
          id="msg-title"
          placeholder="Titulo del mensaje"
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
        />
      </div>

      <div>
        <Label>Mensaje *</Label>
        <RichTextEditor
          content={formData.message}
          onChange={(html) => setFormData((p) => ({ ...p, message: html }))}
          placeholder="Contenido del mensaje"
          className="min-h-[120px]"
        />
      </div>

      <div>
        <Label>Cursos *</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="w-full justify-start text-sm font-normal">
              {formData.courses.length === 0
                ? "Selecciona cursos"
                : formData.courses.length > 3
                ? `${formData.courses.length} cursos seleccionados`
                : courses
                    .filter((c) => formData.courses.includes(c.id))
                    .map(getCourseLabel)
                    .join(", ")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-64 overflow-y-auto p-2">
            <div className="flex flex-col gap-2 mb-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => setFormData((p) => ({ ...p, courses: courses.map((c) => c.id) }))}
              >
                Agregar todos
              </Button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      courses: courses.filter((c) => c.year < 8).map((c) => c.id),
                    }))
                  }
                >
                  Primaria
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      courses: courses.filter((c) => c.year >= 8).map((c) => c.id),
                    }))
                  }
                >
                  Secundaria
                </Button>
              </div>
            </div>
            {isLoadingCourses ? (
              <div className="text-sm text-text-secondary p-2">Cargando cursos...</div>
            ) : (
              courses.map((course) => (
                <DropdownMenuCheckboxItem
                  key={course.id}
                  checked={formData.courses.includes(course.id)}
                  onCheckedChange={(checked) => {
                    setFormData((p) => ({
                      ...p,
                      courses: checked
                        ? [...p.courses, course.id]
                        : p.courses.filter((c) => c !== course.id),
                    }));
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  {getCourseLabel(course)}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Enviando..." : "Crear mensaje"}
        </Button>
      </ModalFooter>
    </div>
  );
}
