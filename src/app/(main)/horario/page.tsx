"use client";

import { Clock } from "lucide-react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import InlineCourseSelector from "@/components/InlineCourseSelector";
import TimetableClient from "./components/TimetableClient";
import TimetableDisplay from "./components/TimetableDisplay";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { LoadingSpinner, PageHeader } from "@/components/sacred";


function HorarioContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const { courses, selectedCourseId, isLoading, error, setSelectedCourseId } =
    useCourseStudentSelection(userInfo?.role || null);

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
    const studentCourseId = courses.length > 0 ? courses[0].id : null;

    if (!studentCourseId) {
      return (
        <div className="space-y-6">
          <PageHeader title="Horario" subtitle="Tu cronograma de clases" />
          <div className="sacred-card text-center py-8">
            <Clock className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-text-primary">Sin curso asignado</p>
            <p className="text-sm text-text-secondary mt-1">
              No estas inscripto en ningun curso
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PageHeader title="Horario" subtitle="Tu cronograma de clases" />
        <TimetableDisplay
          courseId={studentCourseId}
          onBack={() => {}}
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

  // Father with child selected
  if (userInfo?.role === "father" && selectedChild) {
    return (
      <div className="space-y-6">
        <PageHeader title="Horario" subtitle={`Cronograma de ${selectedChild.name}`} />
        <TimetableDisplay
          courseId={selectedChild.course_id}
          onBack={() => {}}
          initialTimetables={[]}
        />
      </div>
    );
  }

  // Admin/Teacher/Preceptor - inline course selector
  return (
    <div className="space-y-6">
      <PageHeader
        title="Horario"
        subtitle="Cronograma de clases"
      />

      <div className="flex flex-wrap items-center gap-3 p-3 sacred-card">
        <InlineCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
        />
      </div>

      {selectedCourseId ? (
        <TimetableClient
          courses={courses}
          initialCourseId={selectedCourseId}
          initialTimetables={[]}
        />
      ) : (
        <div className="sacred-card text-center py-8">
          <Clock className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Selecciona un curso</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para ver el horario
          </p>
        </div>
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
