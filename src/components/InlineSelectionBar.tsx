"use client";

import InlineCourseSelector from "./InlineCourseSelector";
import InlineStudentSelector from "./InlineStudentSelector";
import { AcademicYearSelector } from "./AcademicYearSelector";
import { AcademicYear } from "@/types/academicYear";

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
}

interface Student {
  id: number;
  full_name: string;
}

interface InlineSelectionBarProps {
  courses: Course[];
  selectedCourseId: number | null;
  onCourseChange: (courseId: number) => void;
  students?: Student[];
  selectedStudentId?: number | null;
  onStudentChange?: (studentId: number) => void;
  showStudentSelector?: boolean;
  academicYears?: AcademicYear[];
  selectedYearId?: number | null;
  onYearChange?: (yearId: number | null) => void;
  className?: string;
}

export default function InlineSelectionBar({
  courses,
  selectedCourseId,
  onCourseChange,
  students = [],
  selectedStudentId = null,
  onStudentChange,
  showStudentSelector = true,
  academicYears = [],
  selectedYearId = null,
  onYearChange,
  className = "",
}: InlineSelectionBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 sacred-card ${className}`}
    >
      <InlineCourseSelector
        courses={courses}
        selectedCourseId={selectedCourseId}
        onCourseChange={onCourseChange}
      />

      {showStudentSelector && selectedCourseId && onStudentChange && (
        <InlineStudentSelector
          students={students}
          selectedStudentId={selectedStudentId}
          onStudentChange={onStudentChange}
          disabled={!selectedCourseId || students.length === 0}
        />
      )}

      {academicYears.length > 1 && onYearChange && (
        <AcademicYearSelector
          academicYears={academicYears}
          selectedYearId={selectedYearId ?? null}
          onYearChange={onYearChange}
        />
      )}
    </div>
  );
}
