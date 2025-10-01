"use client";

import { FileText } from "lucide-react";
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
  if (isLoading) {
    return <LoadingPage message="Cargando información de calificaciones..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="icon-wrapper">
                  <FileText className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Calificaciones
                </h1>
              </div>
            </div>
            <ErrorDisplay 
              error={error}
              retry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    );
  }

  // Para estudiantes y padres, mostrar directamente las calificaciones
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="icon-wrapper">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Calificaciones
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {userInfo?.role === "student" 
                ? "Aquí puedes ver todas tus notas y evaluaciones"
                : "Aquí puedes ver las calificaciones de tu hijo"
              }
            </p>
          </div>
          <GradesDisplayWrapper selectedStudentId={selectedChild?.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="icon-wrapper">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Calificaciones
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gestiona y revisa las notas de los estudiantes
          </p>
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
    </div>
  );
}

function CalificacionesWithAuth() {
  const { isLoading: isAuthLoading } = useAuthRedirect();
  
  if (isAuthLoading) {
    return <LoadingPage message="Cargando información de calificaciones..." />;
  }

  return (
    <ErrorBoundary>
      <CalificacionesContent />
    </ErrorBoundary>
  );
}

export default function Calificaciones() {
  return (
    <Suspense fallback={<LoadingPage message="Cargando página de calificaciones..." />}>
      <CalificacionesWithAuth />
    </Suspense>
  );
}
