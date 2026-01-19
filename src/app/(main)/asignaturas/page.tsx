"use client";

import { ChevronLeft } from "lucide-react";

import { useState, useEffect, Suspense } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import SubjectSelector from "./components/SubjectSelector";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (userInfo?.role === "father" || userInfo?.role === "student") {
      setCurrentStep("subjects");
    }
  }, [userInfo?.role, selectedChild]);

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    if (
      userInfo?.role === "teacher" ||
      userInfo?.role === "admin" ||
      userInfo?.role === "preceptor"
    ) {
      setCurrentStep("subjects");
      return;
    }
    await loadStudents(courseId);
    setCurrentStep("student");
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentStep("subjects");
  };

  const handleBack = () => {
    if (currentStep === "subjects" && selectedStudentId) {
      setCurrentStep("student");
      setSelectedStudentId(null);
    } else {
      setCurrentStep("course");
      resetSelection();
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          {currentStep !== "course" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="page-title">Asignaturas</h1>
            <p className="page-subtitle">
              {currentStep === "course" && "Selecciona un curso"}
              {currentStep === "student" && "Selecciona un estudiante"}
              {currentStep === "subjects" && "Materias del curso"}
            </p>
          </div>
        </div>
      </div>

      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
        />
      )}

      {currentStep === "student" && (
        <StudentSelector
          students={students}
          onStudentSelect={handleStudentSelect}
          onBack={handleBack}
          selectedStudentId={selectedStudentId}
        />
      )}

      {currentStep === "subjects" && (
        <SubjectSelectorWrapper selectedCourseId={selectedCourseId} />
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
