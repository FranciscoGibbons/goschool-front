"use client";

import { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpenIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import SubjectMessages from "./SubjectMessages";
import axios from "axios";
import useSubjectsStore from "@/store/subjectsStore";

interface Subject {
  id: number;
  name: string;
  course_id?: number;
}

interface Course {
  id: number;
  name: string;
  year: number;
  section: string;
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

  // Cargar información del curso
  useEffect(() => {
    if (selectedCourseId) {
      const fetchCourse = async () => {
        try {
          const response = await axios.get(
            `/api/proxy/courses/${selectedCourseId}`,
            { withCredentials: true }
          );
          setCourse(response.data);
        } catch (error) {
          console.error("Error loading course:", error);
        }
      };
      fetchCourse();
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (subjects.length === 0) {
      fetchSubjects();
    } else if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects.length]);

  if (isLoadingSubjects) {
    return <div className="text-center py-8">Cargando asignaturas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con información del curso */}
      {course && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {course.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {course.year}° Año - Sección {course.section}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-start">
          <Select
            value={selectedSubject?.id.toString() || ""}
            onValueChange={(value) => {
              const subject = subjects.find((s) => s.id.toString() === value);
              setSelectedSubject(subject || null);
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecciona una materia" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" />
                    <span>{subject.name}</span>
                    {course && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({course.name})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSubject &&
          (() => {
            console.log("Selected subject:", selectedSubject);
            return (
              <SubjectMessages
                subjectId={selectedSubject.id}
                subjectName={selectedSubject.name}
              />
            );
          })()}
      </div>

      {subjects.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay asignaturas disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
