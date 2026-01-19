"use client";

import { useState, useEffect } from "react";
import { BookOpen, GraduationCap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubjectMessages from "./SubjectMessages";
import axios from "axios";
import useSubjectsStore from "@/store/subjectsStore";

interface Subject {
  id: number;
  name: string;
  course_id?: number;
  course_name?: string;
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

  useEffect(() => {
    if (selectedCourseId) {
      const fetchCourse = async () => {
        try {
          const response = await axios.get(`/api/proxy/courses/`, {
            withCredentials: true,
          });
          const allCourses: Course[] = response.data || [];
          const found =
            allCourses.find((c) => Number(c.id) === Number(selectedCourseId)) ||
            null;
          setCourse(found);
        } catch (error) {
          console.error("Error loading course:", error);
        }
      };
      fetchCourse();
    }
  }, [selectedCourseId]);

  useEffect(() => {
    const load = async () => {
      if (selectedCourseId) {
        await fetchSubjects(selectedCourseId);
      } else if (subjects.length === 0) {
        await fetchSubjects();
      }
      if (!selectedSubject && subjects.length > 0) {
        setSelectedSubject(subjects[0]);
      }
    };
    load();
  }, [selectedCourseId, subjects, fetchSubjects, selectedSubject]);


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
                  {subject.course_name && (
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
