"use client";

import { GraduationCap, Users, Check } from "lucide-react";
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
}: CourseSelectorProps) {
  const getCourseLabel = (course: Course) => {
    let yearLabel = "";
    let divisionLabel = "";

    if (course.year >= 8) {
      yearLabel = `${course.year - 7}°`;
      if (course.division === "1") divisionLabel = "A";
      else if (course.division === "2") divisionLabel = "B";
      else if (course.division === "3") divisionLabel = "C";
      else divisionLabel = course.division;
    } else {
      yearLabel = `${course.year}°`;
      if (course.division === "1") divisionLabel = "Mar";
      else if (course.division === "2") divisionLabel = "Gaviota";
      else if (course.division === "3") divisionLabel = "Estrella";
      else divisionLabel = course.division;
    }

    return { year: yearLabel, division: divisionLabel };
  };

  const getShiftLabel = (shift: string) => {
    return shift === "morning" ? "Manana" : "Tarde";
  };

  const getLevelLabel = (level: string) => {
    return level === "primary" ? "Primaria" : "Secundaria";
  };

  const isSecondary = (course: Course) => course.year >= 8;

  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <GraduationCap className="empty-state-icon" />
        <p className="empty-state-title">Sin cursos</p>
        <p className="empty-state-text">No hay cursos disponibles</p>
      </div>
    );
  }

  // Group courses by level
  const primaryCourses = courses.filter((c) => !isSecondary(c));
  const secondaryCourses = courses.filter((c) => isSecondary(c));

  const CourseGrid = ({
    courses,
    title,
    icon: Icon,
  }: {
    courses: Course[];
    title: string;
    icon: typeof GraduationCap;
  }) => {
    if (courses.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {courses.map((course) => {
            const { year, division } = getCourseLabel(course);
            const isSelected = selectedCourseId === course.id;

            return (
              <button
                key={course.id}
                onClick={() => onCourseSelect(course.id)}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-lg border transition-all",
                  "hover:border-foreground/20 hover:bg-accent/50",
                  isSelected
                    ? "border-foreground bg-foreground/5"
                    : "border-border bg-card"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-3.5 w-3.5 text-foreground" />
                  </div>
                )}
                <span className="text-2xl font-semibold">{year}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {division}
                </span>
                <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {getShiftLabel(course.shift)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CourseGrid courses={primaryCourses} title="Primaria" icon={Users} />
      <CourseGrid
        courses={secondaryCourses}
        title="Secundaria"
        icon={GraduationCap}
      />
    </div>
  );
}
