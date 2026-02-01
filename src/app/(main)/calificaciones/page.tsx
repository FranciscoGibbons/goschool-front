"use client";

import { FileText, Users } from "lucide-react";
import { useState } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { ProtectedPage } from "@/components/ProtectedPage";
import InlineSelectionBar from "@/components/InlineSelectionBar";
import GradesDisplay from "./components/GradesDisplay";
import BulkGradeEntry from "./components/BulkGradeEntry";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";

function CalificacionesContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
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
        {academicYears.length > 1 && (
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
          />
        )}
        <GradesDisplay selectedStudentId={selectedChild?.id} academicYearId={selectedYearId} />
      </div>
    );
  }

  const canUseBulk = userInfo?.role === "admin" || userInfo?.role === "teacher" || userInfo?.role === "preceptor";

  // Bulk mode view
  if (isBulkMode && canUseBulk) {
    return (
      <div className="space-y-6">
        <BulkGradeEntry
          onCancel={() => setIsBulkMode(false)}
          onSuccess={() => setIsBulkMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Calificaciones</h1>
            <p className="page-subtitle">Notas del estudiante</p>
          </div>
          {canUseBulk && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkMode(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Carga Masiva
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
        <GradesDisplay selectedStudentId={selectedStudentId} academicYearId={selectedYearId} />
      )}

      {!selectedStudentId && selectedCourseId && students.length > 0 && (
        <div className="sacred-card text-center py-8">
          <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Selecciona un estudiante</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un estudiante del selector para ver sus calificaciones
          </p>
        </div>
      )}

      {!selectedCourseId && (
        <div className="sacred-card text-center py-8">
          <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Selecciona un curso</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para comenzar
          </p>
        </div>
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
