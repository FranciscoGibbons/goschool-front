"use client";

import { Clock, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import TimetableClient from "./components/TimetableClient";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { LoadingSpinner, Button, PageHeader } from "@/components/sacred";


function HorarioContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const { courses, selectedCourseId, isLoading, error, setSelectedCourseId } =
    useCourseStudentSelection(userInfo?.role || null);

  const [currentStep, setCurrentStep] = useState<"course" | "timetable">(
    "course"
  );

  useEffect(() => {
    if (!userInfo?.role) return;

    if (userInfo.role === "student") {
      setCurrentStep("timetable");
    } else if (userInfo.role === "father" && selectedChild) {
      setCurrentStep("timetable");
    }
  }, [userInfo?.role, selectedChild]);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentStep("timetable");
  };

  const handleBack = () => {
    setCurrentStep("course");
    setSelectedCourseId(null);
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
          <PageHeader title="Horario" />
          <div className="sacred-card text-center py-8">
            <p className="text-error text-sm">{error}</p>
          </div>
        </div>

    );
  }

  // Student view - direct timetable
  if (userInfo?.role === "student") {
    return (
      <div className="space-y-6">
        <PageHeader title="Horario" subtitle="Tu cronograma de clases" />
        <TimetableClient
          courses={courses}
          initialCourseId={undefined}
          initialTimetables={[]}
        />
      </div>
    );
  }


  // Father without child selected
  if (userInfo?.role === "father" && !selectedChild) {
    return (
        <div className="space-y-6">
          <PageHeader title="Horario" subtitle="Cronograma de clases" />
          <div className="sacred-card text-center py-8">
            <Clock className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-text-primary">Selecciona un hijo</p>
            <p className="text-sm text-text-secondary mt-1">
              Usa el selector en la barra lateral
            </p>
          </div>
        </div>


    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horario"
        subtitle={
          currentStep === "course"
            ? "Selecciona un curso"
            : "Cronograma de clases"
        }
        action={
          currentStep === "timetable" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : null
        }
      />


      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
        />
      )}

      {currentStep === "timetable" &&
        (selectedCourseId || userInfo?.role === "father") && (
          <TimetableClient
            courses={courses}
            initialCourseId={selectedCourseId || selectedChild?.course_id}
            initialTimetables={[]}
          />
        )}
    </div>
  );
}

export default function Horario() {
  return (
    <ProtectedPage>
      <HorarioContent />
    </ProtectedPage>
  );
}
