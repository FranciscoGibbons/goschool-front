"use client";

import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Suspense } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import GradesDisplay from "./components/GradesDisplay";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingPage, LoadingCard } from "@/components/ui/loading-spinner";
import { SkeletonGrades, SkeletonList } from "@/components/ui/skeleton";

// Componente wrapper para GradesDisplay con error boundary
function GradesDisplayWrapper({ selectedStudentId }: { selectedStudentId?: number | null }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorDisplay 
          error="Error al cargar las calificaciones"
          retry={() => window.location.reload()}
        />
      }
    >
      <Suspense fallback={<SkeletonGrades />}>
        <GradesDisplay selectedStudentId={selectedStudentId || undefined} />
      </Suspense>
    </ErrorBoundary>
  );
}

function CalificacionesContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
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
      // Para padres, ir directamente a ver las calificaciones del hijo seleccionado
      setCurrentStep("grades");
    } else if (userInfo.role === "student") {
      setCurrentStep("grades");
    }
  }, [userInfo?.role, selectedChild]);

  const handleCourseSelect = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);
      await loadStudents(courseId);
      setCurrentStep("student");
    } catch (error) {
      console.error("Error al seleccionar curso:", error);
    }
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

  // Loading states
  if (isAuthLoading || isLoading) {
    return <LoadingPage message="Cargando información de calificaciones..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calificaciones
          </h1>
        </div>
        <ErrorDisplay 
          error={error}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Para estudiantes y padres, mostrar directamente las calificaciones
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calificaciones
          </h1>
        </div>
        <GradesDisplayWrapper selectedStudentId={selectedChild?.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Calificaciones
        </h1>
      </div>

      {currentStep === "course" && (
        <ErrorBoundary
          fallback={
            <ErrorDisplay 
              error="Error al cargar los cursos"
              retry={handleBackToCourse}
            />
          }
        >
          <Suspense fallback={<LoadingCard />}>
            <CourseSelector
              courses={courses}
              onCourseSelect={handleCourseSelect}
              selectedCourseId={selectedCourseId}
              title="Selecciona un curso"
              description="Elige el curso para ver las calificaciones"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {currentStep === "student" && (
        <ErrorBoundary
          fallback={
            <ErrorDisplay 
              error="Error al cargar los estudiantes"
              retry={handleBackToCourse}
            />
          }
        >
          <Suspense fallback={<SkeletonList items={4} />}>
            <StudentSelector
              students={students}
              onStudentSelect={handleStudentSelect}
              onBack={handleBackToCourse}
              selectedStudentId={selectedStudentId}
              title="Selecciona un estudiante"
              description="Elige el estudiante para ver sus calificaciones"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {currentStep === "grades" && selectedStudentId && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToStudent}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver a selección de estudiante
            </button>
          </div>
          <GradesDisplayWrapper selectedStudentId={selectedStudentId || undefined} />
        </div>
      )}
    </div>
  );
}

export default function Calificaciones() {
  return (
    <ErrorBoundary>
      <CalificacionesContent />
    </ErrorBoundary>
  );
}
