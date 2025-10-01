"use client";

import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import TimetableClient from "./components/TimetableClient";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";

function HorarioContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const { courses, selectedCourseId, isLoading, error, setSelectedCourseId } =
    useCourseStudentSelection(userInfo?.role || null);

  const [currentStep, setCurrentStep] = useState<"course" | "timetable">(
    "course"
  );

  // Determinar el paso inicial según el rol
  useEffect(() => {
    if (!userInfo?.role) return;

    if (userInfo.role === "student") {
      // Para estudiantes, ir directamente al horario
      setCurrentStep("timetable");
    } else if (userInfo.role === "father") {
      if (selectedChild) {
        // Si ya hay un hijo seleccionado, ir directamente al horario
        setCurrentStep("timetable");
      } else {
        // Si no hay hijo seleccionado, esperar a que se seleccione en el sidebar
        setCurrentStep("course");
      }
    } else {
      // Para admin, teacher, preceptor: empezar con selección de curso
      setCurrentStep("course");
    }
  }, [userInfo?.role, selectedChild]);

  // Para padres: cuando se selecciona un hijo, ir al horario
  useEffect(() => {
    if (
      userInfo?.role === "father" &&
      selectedChild &&
      currentStep !== "timetable"
    ) {
      setCurrentStep("timetable");
    }
  }, [userInfo?.role, selectedChild, currentStep]);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentStep("timetable");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="icon-wrapper">
                  <Calendar className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Horarios
                </h1>
              </div>
            </div>
            <div className="dashboard-card text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Para estudiantes, mostrar directamente el horario
  if (userInfo?.role === "student") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="icon-wrapper">
                <Calendar className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Horarios
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Aquí puedes ver tu cronograma de clases
            </p>
          </div>
          <TimetableClient
            courses={courses}
            initialCourseId={undefined}
            initialTimetables={[]}
          />
        </div>
      </div>
    );
  }

  // Para padres sin hijo seleccionado
  if (userInfo?.role === "father" && !selectedChild) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="icon-wrapper">
                <Calendar className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Horarios
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Consulta los horarios de clases de tu hijo
            </p>
          </div>
          <div className="dashboard-card text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Selecciona un hijo
            </h3>
            <p className="text-muted-foreground">
              Usa el selector en la barra lateral para elegir el hijo cuyo horario
              deseas ver.
            </p>
          </div>
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
              <Calendar className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Horarios
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gestiona y consulta los cronogramas académicos
          </p>
        </div>

        {currentStep === "course" && (
          <CourseSelector
            courses={courses}
            onCourseSelect={handleCourseSelect}
            selectedCourseId={selectedCourseId}
            title="Seleccionar Curso"
            subtitle="Elige el curso para ver el horario"
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
