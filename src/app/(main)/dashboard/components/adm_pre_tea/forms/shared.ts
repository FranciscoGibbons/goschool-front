"use client";

import { useCallback, useState } from "react";
import { fetchAllPages } from "@/utils/fetchAllPages";
import { toast } from "sonner";

// Shared types
export interface Assessment {
  id: number;
  task: string;
  subject_id: number;
  due_date: string;
  type: string;
}

export interface PubUser {
  id: number;
  photo: string | null;
  course_id: number | null;
  full_name: string;
}

export interface Student {
  id: number;
  full_name: string;
  photo?: string | null;
}

export type SubjectWithCourseName = {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
  course_name?: string;
};

export type CourseOption = {
  id: number;
  name: string;
  year: number;
  division: string;
  shift: string;
};

export interface FormProps {
  onBack: () => void;
  onClose: () => void;
}

// Shared hooks
export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectWithCourseName[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (academicYearId?: number | null) => {
    try {
      setIsLoading(true);
      const params: Record<string, number> = {};
      if (academicYearId) params.academic_year_id = academicYearId;

      const data = await fetchAllPages<{
        id: number;
        name: string;
        course_id: number;
        course_name?: string;
      }>("/api/proxy/subjects/", params);

      setSubjects(
        data.map((s) => ({
          ...s,
          teacher_id: 0,
          course_name: s.course_name || `Curso ${s.course_id}`,
        }))
      );
    } catch {
      toast.error("Error al cargar materias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { subjects, isLoading, load };
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllPages<CourseOption>("/api/proxy/courses/");
      setCourses(data);
    } catch {
      toast.error("Error al cargar cursos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { courses, isLoading, load };
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (courseId: number, academicYearId?: number | null) => {
    if (!courseId) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    try {
      const params: Record<string, number | string> = {
        course: courseId,
        role: "student",
      };
      if (academicYearId) params.academic_year_id = academicYearId;

      const pubUsers = await fetchAllPages<PubUser>("/api/proxy/students/", params);
      const mapped: Student[] = pubUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name || `Estudiante ${u.id}`,
        photo: u.photo,
      }));
      const unique = mapped.filter(
        (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
      );
      setStudents(unique);
    } catch {
      toast.error("Error al cargar estudiantes");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { students, isLoading, load, setStudents };
}

// Course label helper
export function getCourseLabel(course: { year: number; division: string; shift: string }) {
  let yearLabel = "";
  let divisionLabel = "";
  if (course.year >= 8) {
    yearLabel = `${course.year - 7}° secundaria`;
    if (course.division === "1") divisionLabel = "a";
    else if (course.division === "2") divisionLabel = "b";
    else if (course.division === "3") divisionLabel = "c";
    else divisionLabel = course.division;
  } else {
    yearLabel = `${course.year}° primaria`;
    if (course.division === "1") divisionLabel = "Mar";
    else if (course.division === "2") divisionLabel = "Gaviota";
    else if (course.division === "3") divisionLabel = "Estrella";
    else divisionLabel = course.division;
  }
  return `${yearLabel} ${divisionLabel}`;
}
