"use client";

import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Suspense } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import { AssistanceDisplay, AssistanceForm } from "./components";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingPage, LoadingCard } from "@/components/ui/loading-spinner";
import { SkeletonList } from "@/components/ui/skeleton";

// Componente wrapper para AssistanceDisplay con error boundary
function AssistanceDisplayWrapper({ selectedStudentId }: { selectedStudentId?: number | null }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorDisplay 
          error="Error al cargar la información de asistencia"
          retry={() => window.location.reload()}
        />
      }
    >
      <Suspense fallback={<SkeletonList items={5} />}>
        <AssistanceDisplay selectedStudentId={selectedStudentId || undefined} />
      </Suspense>
    </ErrorBoundary>
  );
}

function AsistenciaContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const [currentStep, setCurrentStep] = useState<"course" | "student" | "assistance">("course");
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
      // Para padres, ir directamente a ver la asistencia del hijo seleccionado
      setCurrentStep("assistance");
    } else if (userInfo.role === "student") {
      setCurrentStep("assistance");
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
    setCurrentStep("assistance");
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
    return <LoadingPage message="Cargando información de asistencia..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asistencia
          </h1>
        </div>
        <ErrorDisplay 
          error={error}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Para estudiantes y padres, mostrar directamente la asistencia
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asistencia
          </h1>
        </div>
        <AssistanceDisplayWrapper selectedStudentId={selectedChild?.id} />
      </div>
    );
  }

  // Bloquear acceso a teachers
  if (userInfo?.role === "teacher") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asistencia
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDaysIcon className="size-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acceso no disponible
          </h2>
          <p className="text-muted-foreground max-w-md">
            Los profesores no tienen acceso a la gestión de asistencia. 
            Esta funcionalidad está disponible para preceptores y administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDaysIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Asistencia
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
              description="Elige el curso para ver la asistencia"
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
              description="Elige el estudiante para ver su asistencia"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {currentStep === "assistance" && selectedStudentId && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToStudent}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver a selección de estudiante
            </button>
          </div>
          
          {/* Layout responsive con formulario y display */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Formulario de registro (solo para admin/preceptor) */}
            {userInfo?.role && ["admin", "preceptor"].includes(userInfo.role) && (
              <div className="lg:col-span-1">
                <AssistanceForm 
                  studentId={selectedStudentId}
                  studentName={students.find(s => s.id === selectedStudentId)?.full_name}
                />
              </div>
            )}
            
            {/* Display de asistencia */}
            <div className={`${userInfo?.role && ["admin", "preceptor"].includes(userInfo.role) ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <AssistanceDisplayWrapper selectedStudentId={selectedStudentId || undefined} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Asistencia() {
  return (
    <ErrorBoundary>
      <AsistenciaContent />
    </ErrorBoundary>
  );
}