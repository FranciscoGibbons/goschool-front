"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

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
  selectedCourseId?: number;
}

export default function CourseSelector({
  courses,
  onCourseSelect,
  selectedCourseId,
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
      return <AcademicCapIcon className="w-6 h-6" />;
    } else {
      return <UsersIcon className="w-6 h-6" />;
    }
  };

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay cursos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Selecciona un curso
        </h2>
        <p className="text-muted-foreground">
          Elige el curso para ver su horario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card
            key={course.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCourseId === course.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onCourseSelect(course.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getCourseIcon(course)}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {getCourseLabel(course)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getLevelLabel(course.level)} •{" "}
                    {getShiftLabel(course.shift)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>Ver horario</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCourseId && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onCourseSelect(selectedCourseId)}
            className="px-8"
          >
            Ver horario del curso seleccionado
          </Button>
        </div>
      )}
    </div>
  );
}
