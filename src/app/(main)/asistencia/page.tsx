"use client";

import { CalendarDays, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import { AssistanceDisplay, AssistanceForm } from "./components";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

function AsistenciaContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const [currentStep, setCurrentStep] = useState<"course" | "student" | "assistance">("course");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      setCurrentStep("assistance");
    }
  }, [userInfo?.role, selectedChild]);

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    await loadStudents(courseId);
    setCurrentStep("student");
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

  const handleAssistanceCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const canManage = userInfo?.role === "admin" || userInfo?.role === "preceptor";

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
          <h1 className="page-title">Asistencia</h1>
        </div>
        <div className="sacred-card text-center py-8">
          <p className="text-destructive text-sm">{error}</p>
        </div>

      </div>
    );
  }

  // Student/Father view
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Asistencia</h1>
          <p className="page-subtitle">
            {userInfo?.role === "student"
              ? "Tu registro de asistencia"
              : "Asistencia de tu hijo"}
          </p>
        </div>
        <AssistanceDisplay selectedStudentId={selectedChild?.id} refreshTrigger={refreshTrigger} />
      </div>
    );
  }

  // Teacher blocked
  if (userInfo?.role === "teacher") {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Asistencia</h1>
        </div>
        <div className="empty-state">
          <CalendarDays className="empty-state-icon" />
          <p className="empty-state-title">Acceso restringido</p>
          <p className="empty-state-text">
            Solo preceptores y administradores pueden gestionar asistencia
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
              onClick={currentStep === "assistance" ? handleBackToStudent : handleBackToCourse}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="page-title">Asistencia</h1>
            <p className="page-subtitle">
              {currentStep === "course"
                ? "Selecciona un curso"
                : currentStep === "student"
                ? "Selecciona un estudiante"
                : "Registro de asistencia"}
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

      {currentStep === "assistance" && selectedStudentId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {canManage && (
            <div className="lg:col-span-1">
              <AssistanceForm
                studentId={selectedStudentId}
                studentName={students.find((s) => s.id === selectedStudentId)?.full_name}
                onAssistanceCreated={handleAssistanceCreated}
              />
            </div>
          )}
          <div className={canManage ? "lg:col-span-3" : "lg:col-span-4"}>
            <AssistanceDisplay selectedStudentId={selectedStudentId} refreshTrigger={refreshTrigger} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Asistencia() {
  return (
    <ProtectedPage>
      <AsistenciaContent />
    </ProtectedPage>
  );
}