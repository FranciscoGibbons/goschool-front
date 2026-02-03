"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, GraduationCap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubjectMessages from "./SubjectMessages";
import useSubjectsStore from "@/store/subjectsStore";
import { fetchAllPages } from "@/utils/fetchAllPages";

interface Subject {
  id: number;
  name: string;
  course_id?: number;
  course_name?: string;
  special_course_id?: number;
}

interface Course {
  id: number;
  name: string;
  year: number;
  division: string;
  shift: string;
  level: string;
}

interface SubjectSelectorProps {
  selectedStudentId?: number | null;
  selectedCourseId?: number | null;
}

export default function SubjectSelector({
  selectedCourseId,
}: SubjectSelectorProps) {
  const subjectsStore = useSubjectsStore();
  const {
    subjects,
    fetchSubjects,
    isLoading: isLoadingSubjects,
  } = subjectsStore;
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  const cleanSubjectName = (name: string) => {
    return name.replace(/\s*-\s*\d+°\d+\s*$/, "").trim();
  };

  const hasFetchedRef = useRef(false);

  // Fetch course info
  useEffect(() => {
    if (selectedCourseId) {
      const fetchCourse = async () => {
        try {
          const allCourses = await fetchAllPages<Course>('/api/proxy/courses/');
          const found = allCourses.find((c) => Number(c.id) === Number(selectedCourseId)) || null;
          setCourse(found);
        } catch (error) {
          console.error("Error loading course:", error);
        }
      };
      fetchCourse();
    }
  }, [selectedCourseId]);

  // Fetch subjects - only once per course change
  useEffect(() => {
    if (hasFetchedRef.current) return;

    const load = async () => {
      hasFetchedRef.current = true;
      if (selectedCourseId) {
        await fetchSubjects(selectedCourseId);
      } else {
        await fetchSubjects();
      }
    };
    load();
  }, [selectedCourseId, fetchSubjects]);

  // Reset fetch flag when course changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [selectedCourseId]);

  // Reset selected subject when course changes
  useEffect(() => {
    setSelectedSubject(null);
  }, [selectedCourseId]);


  if (isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando asignaturas...</span>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="empty-state">
        <BookOpen className="empty-state-icon" />
        <p className="empty-state-title">Sin asignaturas</p>
        <p className="empty-state-text">
          No hay asignaturas disponibles para este curso
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Course info */}
      {course && (
        <div className="sacred-card flex items-center gap-3">

          <div className="icon-wrapper">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{course.name}</p>
            <p className="text-xs text-muted-foreground">
              {course.year}° Año - Division {course.division}
            </p>
          </div>
        </div>
      )}

      {/* Subject selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={selectedSubject?.id.toString() || ""}
          onValueChange={(value) => {
            const subject = subjects.find((s) => s.id.toString() === value);
            setSelectedSubject(subject || null);
          }}
        >
          <SelectTrigger className="w-full sm:w-72 h-10">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Selecciona una materia" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem
                key={subject.id}
                value={subject.id.toString()}
                className="py-2.5"
              >
                <span className="text-sm">
                  {cleanSubjectName(subject.name)}
                  {subject.special_course_id && (
                    <span className="text-xs text-primary ml-1">(CE)</span>
                  )}
                  {subject.course_name && !subject.special_course_id && (
                    <span className="text-muted-foreground ml-1">
                      ({subject.course_name})
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject messages */}
      {selectedSubject && (
        <SubjectMessages
          subjectId={selectedSubject.id}
          subjectName={cleanSubjectName(selectedSubject.name)}
        />
      )}
    </div>
  );
}
