"use client";

import { useState } from "react";
import { useAssistance } from "@/hooks/useAssistance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDaysIcon, PlusIcon } from "@heroicons/react/24/outline";
import userInfoStore from "@/store/userInfoStore";
import type { NewAssistance } from "../../../../types/assistance";

interface AssistanceFormProps {
  studentId?: number;
  studentName?: string;
  onSuccess?: () => void;
}

export default function AssistanceForm({ 
  studentId, 
  studentName, 
  onSuccess 
}: AssistanceFormProps) {
  const { userInfo } = userInfoStore();
  const { createAssistance } = useAssistance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewAssistance>({
    student_id: studentId || 0,
    presence: "",
    date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  });

  // Solo mostrar el formulario para admin y preceptor
  if (!userInfo?.role || !["admin", "preceptor"].includes(userInfo.role)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.presence || !formData.date) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createAssistance(formData);
      if (success) {
        // Resetear formulario
        setFormData({
          student_id: studentId || 0,
          presence: "",
          date: new Date().toISOString().split('T')[0],
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating assistance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon className="size-5 text-primary" />
          Registrar Asistencia
        </CardTitle>
        {studentName && (
          <p className="text-sm text-muted-foreground">
            Estudiante: {studentName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estado de Asistencia
            </label>
            <Select
              value={formData.presence}
              onValueChange={(value) =>
                setFormData({ ...formData, presence: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Presente
                  </div>
                </SelectItem>
                <SelectItem value="absent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Ausente
                  </div>
                </SelectItem>
                <SelectItem value="late">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Tardanza
                  </div>
                </SelectItem>
                <SelectItem value="justified">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Justificado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.presence}
          >
            <PlusIcon className="size-4 mr-2" />
            {isSubmitting ? "Registrando..." : "Registrar Asistencia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}