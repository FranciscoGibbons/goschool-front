"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  preceptor_id?: number;
}

interface CourseSelectorProps {
  courses: Course[];
  onCourseSelect: (courseId: number) => void;
  selectedCourseId?: number | null;
  title?: string;
  description?: string;
  subtitle?: string;
}

export default function CourseSelector({
  courses,
  onCourseSelect,
  selectedCourseId,
  title = "Selecciona un curso",
  description = "Elige el curso para continuar",
  subtitle,
}: CourseSelectorProps) {
  const getCourseLabel = (course: Course) => {
    let yearLabel = "";
    let divisionLabel = "";

    if (course.year >= 8) {
      yearLabel = `${course.year - 7}° secundaria`;
      // Secundaria: 1=a, 2=b, 3=c
      if (course.division === "1") divisionLabel = "a";
      else if (course.division === "2") divisionLabel = "b";
      else if (course.division === "3") divisionLabel = "c";
      else divisionLabel = course.division;
    } else {
      yearLabel = `${course.year}° primaria`;
      // Primaria: 1=Mar, 2=Gaviota, 3=Estrella
      if (course.division === "1") divisionLabel = "Mar";
      else if (course.division === "2") divisionLabel = "Gaviota";
      else if (course.division === "3") divisionLabel = "Estrella";
      else divisionLabel = course.division;
    }

    return `${yearLabel} ${divisionLabel}`;
  };

  const getShiftLabel = (shift: string) => {
    return shift === "morning" ? "Mañana" : "Tarde";
  };

  const getLevelLabel = (level: string) => {
    return level === "primary" ? "Primaria" : "Secundaria";
  };

  const getCourseIcon = (course: Course) => {
    if (course.year >= 8) {
      return <GraduationCap className="h-5 w-5 text-primary" />;
    } else {
      return <Users className="h-5 w-5 text-primary" />;
    }
  };

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No hay cursos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="heading-2">{title}</h1>
        <p className="body-text text-muted-foreground">
          {subtitle || description}
        </p>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              selectedCourseId === course.id
                ? "ring-2 ring-primary bg-primary/5 border-primary"
                : "hover:border-accent-foreground/20"
            )}
            onClick={() => onCourseSelect(course.id)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedCourseId === course.id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCourseSelect(course.id);
              }
            }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                  {getCourseIcon(course)}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold">
                    {getCourseLabel(course)}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {getLevelLabel(course.level)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getShiftLabel(course.shift)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Seleccionar curso</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botón de confirmación */}
      {selectedCourseId && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => onCourseSelect(selectedCourseId)}
            size="lg"
            className="px-8"
          >
            Continuar con el curso seleccionado
          </Button>
        </div>
      )}
    </div>
  );
}
