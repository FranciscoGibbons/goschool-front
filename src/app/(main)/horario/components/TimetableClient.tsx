"use client";

import React, { useState } from "react";
import CourseSelector from "./CourseSelector";
import TimetableDisplay from "./TimetableDisplay";

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  preceptor_id?: number;
}

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface TimetableClientProps {
  courses: Course[];
  initialCourseId?: number | undefined;
  initialTimetables?: Timetable[];
}

const TimetableClient: React.FC<TimetableClientProps> = ({
  courses,
  initialCourseId,
  initialTimetables,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    initialCourseId || null
  );

  // Si hay un curso seleccionado, mostrar el horario
  if (selectedCourseId) {
    return (
      <TimetableDisplay
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
        initialTimetables={
          selectedCourseId === initialCourseId ? initialTimetables : undefined
        }
      />
    );
  }

  // Si no hay curso seleccionado, mostrar selector
  return (
    <CourseSelector
      courses={courses}
      onCourseSelect={setSelectedCourseId}
      selectedCourseId={selectedCourseId || undefined}
    />
  );
};

export default TimetableClient;