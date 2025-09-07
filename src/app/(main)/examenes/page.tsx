"use client";

import { useState, useEffect } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import ExamList from "./components/ExamList";
import userInfoStore from "@/store/userInfoStore";
import { Role } from "@/utils/types";
import { Exam } from "@/utils/types";
import axios from "axios";

// Use the Exam type from utils/types
type ExamWithSubjectId = Exam & {
  subject_id: number;
};

interface Subject {
  id: number;
  name: string;
  course_id: number;
}

export default function Exams() {
  const { userInfo } = userInfoStore();
  const {
    courses,
    selectedCourseId,
    isLoading,
    error,
    setSelectedCourseId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const [currentStep, setCurrentStep] = useState<"course" | "exams">("course");
  const [exams, setExams] = useState<ExamWithSubjectId[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Determinar el paso inicial según el rol
  useEffect(() => {
    if (userInfo?.role === "student") {
      setCurrentStep("exams");
    }
  }, [userInfo?.role]);

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentStep("exams");
  };

  const handleBackToCourse = () => {
    setCurrentStep("course");
  };

  // Cargar exámenes y materias cuando se selecciona un curso o es student
  useEffect(() => {
    const loadExamsAndSubjects = async () => {
      if (currentStep === "exams") {
        try {
          const [examsResponse, subjectsResponse] = await Promise.all([
            axios.get("/api/proxy/assessments/", { withCredentials: true }),
            axios.get("/api/proxy/subjects/", { withCredentials: true }),
          ]);
          setExams(examsResponse.data);
          setSubjects(subjectsResponse.data);
        } catch (err) {
          console.error("Error loading exams and subjects:", err);
        }
      }
    };

    loadExamsAndSubjects();
  }, [currentStep]);

  // Filtrar por curso seleccionado
  const filteredSubjects = selectedCourseId
    ? subjects.filter((s) => Number(s.course_id) === Number(selectedCourseId))
    : subjects;

  const subjectIdSet = new Set(filteredSubjects.map((s) => s.id));
  const filteredExams = selectedCourseId
    ? exams.filter((e) => subjectIdSet.has(e.subject_id))
    : exams;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
        </div>
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
        </div>
        <div className="flex justify-center py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
      </div>

      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
          title="Selecciona un curso"
          description="Elige el curso para ver las evaluaciones"
        />
      )}

      {currentStep === "exams" && (
        <div className="space-y-6">
          {userInfo?.role !== "student" && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToCourse}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Volver a selección de curso
              </button>
            </div>
          )}
          <ExamList 
            exams={filteredExams} 
            role={userInfo?.role as Role} 
            subjects={filteredSubjects} 
          />
        </div>
      )}
    </div>
  );
}
