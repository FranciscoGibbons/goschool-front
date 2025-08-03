"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftIcon, UserIcon } from "@heroicons/react/24/outline";

interface Student {
  id: number;
  full_name: string;
  photo?: string;
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
  if (students.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay estudiantes disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <Card
            key={`student-${student.id}`}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedStudentId === student.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onStudentSelect(student.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.photo} alt={student.full_name} />
                  <AvatarFallback>
                    <UserIcon className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{student.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Estudiante</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="w-4 h-4" />
                <span>Seleccionar estudiante</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudentId && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onStudentSelect(selectedStudentId)}
            className="px-8"
          >
            Continuar con el estudiante seleccionado
          </Button>
        </div>
      )}
    </div>
  );
}
