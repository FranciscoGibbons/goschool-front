"use client";

import { Suspense } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import InlineCourseSelector from "@/components/InlineCourseSelector";
import SubjectSelector from "./components/SubjectSelector";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function SubjectSelectorWrapper({
  selectedCourseId,
}: {
  selectedCourseId?: number | null;
}) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorDisplay
          error="Error al cargar las asignaturas"
          retry={() => window.location.reload()}
        />
      }
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <SubjectSelector selectedCourseId={selectedCourseId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function AsignaturasContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const {
    courses,
    selectedCourseId,
    isLoading,
    error,
    setSelectedCourseId,
  } = useCourseStudentSelection(userInfo?.role || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Asignaturas</h1>
          <p className="page-subtitle">Materias y contenidos</p>
        </div>
        <ErrorDisplay error={error} retry={() => window.location.reload()} />
      </div>
    );
  }

  // Student/Father view - direct subjects
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Asignaturas</h1>
          <p className="page-subtitle">Materias y contenidos del curso</p>
        </div>
        <SubjectSelectorWrapper selectedCourseId={selectedChild?.course_id} />
      </div>
    );
  }

  // Staff view with inline course selector
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Asignaturas</h1>
        <p className="page-subtitle">Materias del curso</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-3 sacred-card">
        <InlineCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
        />
      </div>

      {selectedCourseId ? (
        <SubjectSelectorWrapper selectedCourseId={selectedCourseId} />
      ) : (
        <div className="sacred-card text-center py-8">
          <p className="text-sm font-medium text-text-primary">Selecciona un curso</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para ver las asignaturas
          </p>
        </div>
      )}
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
