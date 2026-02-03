"use client";

import { useState, useEffect } from "react";
import { DisciplinarySanctionForm } from "@/utils/types";
import {
  Button,
  Label,
  Input,
  Textarea,
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
import { SANCTION_TYPES, SANCTION_LABELS } from "@/types/disciplinarySanction";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { FormProps, useCourses, useStudents, getCourseLabel } from "./shared";

export default function CreateSanctionForm({ onBack, onClose }: FormProps) {
  const [formData, setFormData] = useState<DisciplinarySanctionForm>({
    student_id: "",
    sanction_type: "",
    quantity: "1",
    description: "",
    date: new Date().toISOString().split("T")[0],
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
      setFormData((p) => ({ ...p, student_id: "" }));
    }
  }, [selectedCourseId, selectedYearId, loadStudents]);

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.sanction_type || !formData.quantity || !formData.description || !formData.date) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      toast.error("La cantidad debe ser un numero positivo");
      return;
    }

    if (formData.description.trim().length < 10) {
      toast.error("La descripcion debe tener al menos 10 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        student_id: Number(formData.student_id),
        sanction_type: formData.sanction_type,
        quantity,
        description: formData.description.trim(),
        date: formData.date,
      };

      const res = await fetch("/api/proxy/disciplinary_sanction", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Sancion disciplinaria creada exitosamente");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Error al crear sancion");
      }
    } catch {
      toast.error("Error al crear sancion");
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
        <Label>Estudiante *</Label>
        <Select
          value={formData.student_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, student_id: v }))}
          disabled={isLoadingStudents || !selectedCourseId}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !selectedCourseId ? "Primero selecciona un curso" : isLoadingStudents ? "Cargando..." : "Selecciona un estudiante"
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
        <Label>Tipo de sancion *</Label>
        <Select
          value={formData.sanction_type}
          onValueChange={(v) => setFormData((p) => ({ ...p, sanction_type: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo de sancion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SANCTION_TYPES.ADMONITION}>{SANCTION_LABELS[SANCTION_TYPES.ADMONITION]}</SelectItem>
            <SelectItem value={SANCTION_TYPES.WARNING}>{SANCTION_LABELS[SANCTION_TYPES.WARNING]}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cantidad *</Label>
          <Input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData((p) => ({ ...p, quantity: e.target.value }))}
          />
        </div>
        <div>
          <Label>Fecha *</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Descripcion *</Label>
        <Textarea
          placeholder="Describe la situacion (minimo 10 caracteres)"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className="min-h-[100px]"
          maxLength={500}
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>Minimo 10 caracteres</span>
          <span>{formData.description.length}/500</span>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear sancion"}
        </Button>
      </ModalFooter>
    </div>
  );
}
