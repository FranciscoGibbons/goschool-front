"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import TimetableClient from "./components/TimetableClient";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";

export default function Horario() {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Horario
          </h1>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  // Para estudiantes, mostrar directamente el horario
  if (userInfo?.role === "student") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Horario
          </h1>
        </div>
        <TimetableClient
          courses={courses}
          initialCourseId={undefined}
          initialTimetables={[]}
        />
      </div>
    );
  }

  // Para padres sin hijo seleccionado
  if (userInfo?.role === "father" && !selectedChild) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Horario
          </h1>
        </div>
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Selecciona un hijo
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Usa el selector en la barra lateral para elegir el hijo cuyo horario
            deseas ver.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Horario
        </h1>
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
  );
}
