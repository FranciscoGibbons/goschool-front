"use client";

import { CalendarDays, Users } from "lucide-react";
import { useState } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { ProtectedPage } from "@/components/ProtectedPage";
import InlineSelectionBar from "@/components/InlineSelectionBar";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { AssistanceDisplay, AssistanceForm } from "./components";
import BulkAttendance from "./components/BulkAttendance";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

function AsistenciaContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    isLoading,
    error,
    setSelectedCourseId,
    setSelectedStudentId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const {
    academicYears,
    selectedYearId,
    setSelectedYearId,
  } = useAcademicYears();

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
        {academicYears.length > 1 && (
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
          />
        )}
        <AssistanceDisplay selectedStudentId={selectedChild?.id} refreshTrigger={refreshTrigger} academicYearId={selectedYearId} />
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
        <div className="sacred-card text-center py-8">
          <CalendarDays className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Acceso restringido</p>
          <p className="text-sm text-text-secondary mt-1">
            Solo preceptores y administradores pueden gestionar asistencia
          </p>
        </div>
      </div>
    );
  }

  // Bulk mode view
  if (isBulkMode && canManage) {
    return (
      <div className="space-y-6">
        <BulkAttendance
          onCancel={() => setIsBulkMode(false)}
          onSuccess={() => {
            setIsBulkMode(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asistencia</h1>
            <p className="page-subtitle">Registro de asistencia</p>
          </div>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkMode(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Asistencia por Curso
            </Button>
          )}
        </div>
      </div>

      <InlineSelectionBar
        courses={courses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        students={students}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        showStudentSelector={true}
        academicYears={academicYears}
        selectedYearId={selectedYearId}
        onYearChange={setSelectedYearId}
      />

      {selectedStudentId && (
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
            <AssistanceDisplay selectedStudentId={selectedStudentId} refreshTrigger={refreshTrigger} academicYearId={selectedYearId} />
          </div>
        </div>
      )}

      {!selectedStudentId && selectedCourseId && students.length > 0 && (
        <div className="sacred-card text-center py-8">
          <CalendarDays className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Selecciona un estudiante</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un estudiante del selector para ver su asistencia
          </p>
        </div>
      )}

      {!selectedCourseId && (
        <div className="sacred-card text-center py-8">
          <CalendarDays className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Selecciona un curso</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para comenzar
          </p>
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
