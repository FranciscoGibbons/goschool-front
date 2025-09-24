"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No hay estudiantes disponibles
            </p>
            <Button variant="outline" onClick={onBack} className="mt-4">
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
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 mt-1"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="heading-2">{title}</h1>
          <p className="body-text text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Grid de estudiantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map((student) => (
          <Card
            key={`student-${student.id}`}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              selectedStudentId === student.id
                ? "ring-2 ring-primary bg-primary/5 border-primary"
                : "hover:border-accent-foreground/20"
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
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="h-16 w-16 ring-2 ring-background shadow-sm">
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
                  <Badge variant="secondary" className="text-xs">
                    Estudiante
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
