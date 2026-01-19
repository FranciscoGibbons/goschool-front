"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/sacred";

import { ArrowLeft, User, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: number;
  full_name: string;
  photo?: string | null;
}

interface StudentSelectorProps {
  students: Student[];
  onStudentSelect: (studentId: number) => void;
  onBack: () => void;
  selectedStudentId?: number | null;
  title?: string;
  description?: string;
}

export default function StudentSelector({
  students,
  onStudentSelect,
  onBack,
  selectedStudentId,
  title = "Selecciona un estudiante",
  description = "Elige el estudiante para ver su información",
}: StudentSelectorProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (students.length === 0) {
    return (
      <div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-base">
              No hay estudiantes disponibles
            </p>
            <Button variant="secondary" onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con botón de regreso */}
      <div className="flex items-start gap-4">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex items-center gap-2 mt-1"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Grid de estudiantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {students.map((student) => (
          <Card
            key={`student-${student.id}`}
            interactive
            className={cn(
              "transition-colors",
              selectedStudentId === student.id
                ? "border-primary/60 bg-surface-muted"
                : ""
            )}
            onClick={() => onStudentSelect(student.id)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedStudentId === student.id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onStudentSelect(student.id);
              }
            }}
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center text-center gap-3">
                <Avatar className="h-16 w-16 ring-1 ring-border">
                  <AvatarImage
                    src={student.photo || undefined}
                    alt={student.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(student.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {student.full_name}
                  </CardTitle>
                  <Badge variant="neutral" className="text-xs">
                    Estudiante
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <User className="h-4 w-4" />
                <span>Seleccionar</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botón de confirmación */}
      {selectedStudentId && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => onStudentSelect(selectedStudentId)}
            size="lg"
            className="px-8"
          >
            Continuar con el estudiante seleccionado
          </Button>
        </div>
      )}
    </div>

  );
}
