"use client";

import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import GradesDisplay from "./components/GradesDisplay";
import userInfoStore from "@/store/userInfoStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Calificaciones() {
  // Call all hooks at the top level
  const { userInfo } = userInfoStore();
  const [currentStep, setCurrentStep] = useState<"course" | "student" | "grades">("course");
  const { isLoading: isAuthLoading } = useAuthRedirect();
  
  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    isLoading,
    error,
    setSelectedCourseId,
    setSelectedStudentId,
    loadStudents,
    resetSelection,
  } = useCourseStudentSelection(userInfo?.role || null);

  // Determinar el paso inicial según el rol
  useEffect(() => {
    if (!userInfo?.role) return;
    
    if (userInfo.role === "father") {
      if (courses.length === 1 && students.length === 1) {
        setCurrentStep("grades");
      } else if (courses.length === 1) {
        setCurrentStep("student");
      }
    } else if (userInfo.role === "student") {
      setCurrentStep("grades");
    }
  }, [userInfo?.role, courses.length, students.length]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    await loadStudents(courseId);
    setCurrentStep("student");
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentStep("grades");
  };

  const handleBackToCourse = () => {
    setCurrentStep("course");
    resetSelection();
  };

  const handleBackToStudent = () => {
    setCurrentStep("student");
    setSelectedStudentId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calificaciones
          </h1>
        </div>
        <div className="text-center py-8">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calificaciones
          </h1>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  // Para estudiantes, mostrar directamente las calificaciones
  if (userInfo?.role === "student") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calificaciones
          </h1>
        </div>
        <GradesDisplay />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Calificaciones
        </h1>
      </div>

      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
          title="Selecciona un curso"
          description="Elige el curso para ver las calificaciones"
        />
      )}

      {currentStep === "student" && (
        <StudentSelector
          students={students}
          onStudentSelect={handleStudentSelect}
          onBack={handleBackToCourse}
          selectedStudentId={selectedStudentId}
          title="Selecciona un estudiante"
          description="Elige el estudiante para ver sus calificaciones"
        />
      )}

      {currentStep === "grades" && selectedStudentId && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToStudent}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Volver a selección de estudiante
            </button>
          </div>
          <GradesDisplay selectedStudentId={selectedStudentId} />
        </div>
      )}
    </div>
  );
}
