"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Suspense } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import SubjectSelector from "./components/SubjectSelector";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingPage, LoadingCard } from "@/components/ui/loading-spinner";
import { SkeletonList } from "@/components/ui/skeleton";

// Componente wrapper para el selector de asignaturas con suspense
function SubjectSelectorWrapper({ selectedCourseId }: { selectedCourseId?: number | null }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorDisplay 
          error="Error al cargar las asignaturas"
          retry={() => window.location.reload()}
        />
      }
    >
      <Suspense fallback={<SkeletonList items={6} />}>
        <SubjectSelector selectedCourseId={selectedCourseId} />
      </Suspense>
    </ErrorBoundary>
  );
}

// Componente principal con error boundary
function AsignaturasContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
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
      // Para padres, ir directamente a ver las asignaturas del hijo seleccionado
      setCurrentStep("subjects");
    } else if (userInfo?.role === "student") {
      setCurrentStep("subjects");
    }
  }, [userInfo?.role, selectedChild]);

  const handleCourseSelect = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);
      // Para teacher/admin/preceptor no hace falta seleccionar estudiante
      if (userInfo?.role === "teacher" || userInfo?.role === "admin" || userInfo?.role === "preceptor") {
        setCurrentStep("subjects");
        return;
      }
      await loadStudents(courseId);
      setCurrentStep("student");
    } catch (error) {
      console.error("Error al seleccionar curso:", error);
    }
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

  // Loading state
  if (isLoading) {
    return <LoadingPage message="Cargando información de asignaturas..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <BookOpenIcon className="size-8 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Asignaturas
            </h1>
          </div>
        </header>
        <ErrorDisplay 
          error={error}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Para estudiantes y padres, mostrar directamente las asignaturas
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <BookOpenIcon className="size-8 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Asignaturas
            </h1>
          </div>
        </header>
        <main>
          <SubjectSelectorWrapper selectedCourseId={selectedChild?.course_id} />
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <BookOpenIcon className="size-8 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asignaturas
          </h1>
        </div>
      </header>

      <main>
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
              <section aria-label="Selección de curso">
                <CourseSelector
                  courses={courses}
                  onCourseSelect={handleCourseSelect}
                  selectedCourseId={selectedCourseId}
                  title="Selecciona un curso"
                  description="Elige el curso para ver las asignaturas"
                />
              </section>
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
              <section aria-label="Selección de estudiante">
                <StudentSelector
                  students={students}
                  onStudentSelect={handleStudentSelect}
                  onBack={handleBackToCourse}
                  selectedStudentId={selectedStudentId}
                  title="Selecciona un estudiante"
                  description="Elige el estudiante para ver sus asignaturas"
                />
              </section>
            </Suspense>
          </ErrorBoundary>
        )}

        {currentStep === "subjects" && (
          <section aria-label="Lista de asignaturas" className="space-y-6">
            <nav aria-label="Navegación de regreso">
              {!(userInfo?.role === "teacher" || userInfo?.role === "admin" || userInfo?.role === "preceptor") && (
                <button
                  onClick={handleBackToStudent}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label="Volver a selección de estudiante"
                >
                  ← Volver a selección de estudiante
                </button>
              )}
            </nav>
            <SubjectSelectorWrapper selectedCourseId={selectedCourseId} />
          </section>
        )}
      </main>
    </div>
  );
}

export default function Asignaturas() {
  return (
    <ProtectedPage>
      <ErrorBoundary>
        <AsignaturasContent />
      </ErrorBoundary>
    </ProtectedPage>
  );
}
