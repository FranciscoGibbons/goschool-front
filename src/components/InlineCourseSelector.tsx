"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/sacred";

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
}

interface InlineCourseSelectorProps {
  courses: Course[];
  selectedCourseId: number | null;
  onCourseChange: (courseId: number) => void;
  disabled?: boolean;
  className?: string;
}

function getCourseLabel(course: Course) {
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

  const shift = course.shift === "morning" ? "M" : "T";
  return `${yearLabel} ${divisionLabel} (${shift})`;
}

function isSecondary(course: Course) {
  return course.year >= 8;
}

export default function InlineCourseSelector({
  courses,
  selectedCourseId,
  onCourseChange,
  disabled = false,
  className = "",
}: InlineCourseSelectorProps) {
  const primaryCourses = courses.filter((c) => !isSecondary(c));
  const secondaryCourses = courses.filter((c) => isSecondary(c));

  return (
    <Select
      value={selectedCourseId?.toString() ?? ""}
      onValueChange={(value) => onCourseChange(Number(value))}
      disabled={disabled || courses.length === 0}
    >
      <SelectTrigger className={`w-[180px] ${className}`}>
        <SelectValue placeholder="Seleccionar curso" />
      </SelectTrigger>
      <SelectContent>
        {primaryCourses.length > 0 && (
          <SelectGroup>
            <SelectLabel>Primaria</SelectLabel>
            {primaryCourses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {getCourseLabel(course)}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {secondaryCourses.length > 0 && (
          <SelectGroup>
            <SelectLabel>Secundaria</SelectLabel>
            {secondaryCourses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {getCourseLabel(course)}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
