"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import SubjectSelector from "./components/SubjectSelector";
import userInfoStore from "@/store/userInfoStore";

export default function Asignaturas() {
  const { userInfo } = userInfoStore();
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

  const [currentStep, setCurrentStep] = useState<
    "course" | "student" | "subjects"
  >("course");

  // Determinar el paso inicial según el rol
  useEffect(() => {
    if (userInfo?.role === "father") {
      if (courses.length === 1 && students.length === 1) {
        setCurrentStep("subjects");
      } else if (courses.length === 1) {
        setCurrentStep("student");
      }
    } else if (userInfo?.role === "student") {
      setCurrentStep("subjects");
    }
  }, [userInfo?.role, courses.length, students.length]);

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    await loadStudents(courseId);
    setCurrentStep("student");
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentStep("subjects");
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asignaturas
          </h1>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  // Para estudiantes, mostrar directamente las asignaturas
  if (userInfo?.role === "student") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asignaturas
          </h1>
        </div>
        <SubjectSelector />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Asignaturas
        </h1>
      </div>

      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
          title="Selecciona un curso"
          description="Elige el curso para ver las asignaturas"
        />
      )}

      {currentStep === "student" && (
        <StudentSelector
          students={students}
          onStudentSelect={handleStudentSelect}
          onBack={handleBackToCourse}
          selectedStudentId={selectedStudentId}
          title="Selecciona un estudiante"
          description="Elige el estudiante para ver sus asignaturas"
        />
      )}

      {currentStep === "subjects" && selectedStudentId && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToStudent}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Volver a selección de estudiante
            </button>
          </div>
          <SubjectSelector
            selectedStudentId={selectedStudentId}
            selectedCourseId={selectedCourseId}
          />
        </div>
      )}
    </div>
  );
}
