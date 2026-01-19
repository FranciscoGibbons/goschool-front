"use client";

import { FileText, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import GradesDisplay from "./components/GradesDisplay";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (!userInfo?.role) return;

    if (userInfo.role === "student" || userInfo.role === "father") {
      setCurrentStep("grades");
    }
  }, [userInfo?.role, selectedChild]);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Calificaciones</h1>
        </div>
        <div className="sacred-card text-center py-8">
          <p className="text-destructive text-sm">{error}</p>
        </div>

      </div>
    );
  }

  // Student/Father view - direct grades
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Calificaciones</h1>
          <p className="page-subtitle">
            {userInfo?.role === "student"
              ? "Tu rendimiento academico"
              : "Rendimiento de tu hijo"}
          </p>
        </div>
        <GradesDisplay selectedStudentId={selectedChild?.id} />
      </div>
    );
  }

  // Father without child selected
  if (userInfo?.role === "father" && !selectedChild) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Calificaciones</h1>
        </div>
        <div className="empty-state">
          <FileText className="empty-state-icon" />
          <p className="empty-state-title">Selecciona un hijo</p>
          <p className="empty-state-text">
            Usa el selector en la barra lateral
          </p>
        </div>
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
              onClick={currentStep === "grades" ? handleBackToStudent : handleBackToCourse}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="page-title">Calificaciones</h1>
            <p className="page-subtitle">
              {currentStep === "course"
                ? "Selecciona un curso"
                : currentStep === "student"
                ? "Selecciona un estudiante"
                : "Notas del estudiante"}
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
          onBack={handleBackToCourse}
          selectedStudentId={selectedStudentId}
        />
      )}

      {currentStep === "grades" && selectedStudentId && (
        <GradesDisplay selectedStudentId={selectedStudentId} />
      )}
    </div>
  );
}

export default function Calificaciones() {
  return (
    <ProtectedPage>
      <CalificacionesContent />
    </ProtectedPage>
  );
}
