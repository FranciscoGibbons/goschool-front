"use client";

import React, { useState, useEffect } from "react";
import { Plus, ChevronLeft } from "lucide-react";

import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useDisciplinarySanctions } from "@/hooks/useDisciplinarySanctions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import { SanctionDisplay, SanctionForm } from "./components";
import { DisciplinarySanction, NewDisciplinarySanction, UpdateDisciplinarySanction } from "@/types/disciplinarySanction";
import { parseLocalDate } from "@/utils/dateHelpers";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import {
  LoadingSpinner,
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/sacred";


function ConductaContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    selectedStudent,
    isLoading: isLoadingSelection,
    setSelectedCourseId,
    setSelectedStudentId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const {
    sanctions,
    isLoading: isLoadingSanctions,
    error,
    fetchSanctions,
    createSanction,
    updateSanction,
    deleteSanction,
  } = useDisciplinarySanctions();

  const {
    academicYears,
    selectedYearId,
    setSelectedYearId,
  } = useAcademicYears();

  const [showForm, setShowForm] = useState(false);
  const [editingSanction, setEditingSanction] = useState<DisciplinarySanction | null>(null);
  const [sanctionToDelete, setSanctionToDelete] = useState<DisciplinarySanction | null>(null);
  const [currentStep, setCurrentStep] = useState<"course" | "student" | "content">("course");

  const canCreate = userInfo?.role === "admin" || userInfo?.role === "preceptor";
  const canEdit = userInfo?.role === "admin" || userInfo?.role === "preceptor";
  const canDelete = userInfo?.role === "admin" || userInfo?.role === "preceptor";
  const shouldShowSelectors = userInfo?.role !== "student" && userInfo?.role !== "father";

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentStep("student");
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentStep("content");
  };

  const handleBackToCourse = () => {
    setSelectedStudentId(null);
    setCurrentStep("course");
    setShowForm(false);
    setEditingSanction(null);
  };

  const handleBackToStudent = () => {
    setSelectedStudentId(null);
    setCurrentStep("student");
    setShowForm(false);
    setEditingSanction(null);
  };

  useEffect(() => {
    if (userInfo?.role === "student" || userInfo?.role === "father") {
      setCurrentStep("content");
    } else if (!shouldShowSelectors) {
      setCurrentStep("content");
    } else {
      setCurrentStep("course");
    }
  }, [userInfo?.role, shouldShowSelectors]);

  useEffect(() => {
    const filters: { student_id?: number; academic_year_id?: number } = {};
    if (selectedYearId) {
      filters.academic_year_id = selectedYearId;
    }

    if (userInfo?.role === "student") {
      fetchSanctions(filters);
    } else if (userInfo?.role === "father") {
      if (selectedChild) {
        fetchSanctions({ ...filters, student_id: selectedChild.id });
      } else {
        fetchSanctions(filters);
      }
    } else if (selectedStudent) {
      fetchSanctions({ ...filters, student_id: selectedStudent.id });
    }
  }, [selectedStudent, selectedChild, userInfo, fetchSanctions, selectedYearId]);

  const handleCreateSanction = async (data: NewDisciplinarySanction) => {
    const success = await createSanction(data);
    if (success) {
      setShowForm(false);
      if (selectedStudent) {
        await fetchSanctions({ student_id: selectedStudent.id });
      } else if (userInfo?.role === "student") {
        await fetchSanctions();
      }
    }
  };

  const handleUpdateSanction = async (data: {
    disciplinary_sanction_id: number;
    updateData: UpdateDisciplinarySanction;
  }) => {
    const success = await updateSanction(data.disciplinary_sanction_id, data.updateData);
    if (success) {
      setEditingSanction(null);
      if (selectedStudent) {
        await fetchSanctions({ student_id: selectedStudent.id });
      } else if (userInfo?.role === "student") {
        await fetchSanctions();
      }
    }
  };

  const handleDeleteSanction = async () => {
    if (!sanctionToDelete) return;

    const success = await deleteSanction(sanctionToDelete.disciplinary_sanction_id);
    if (success) {
      setSanctionToDelete(null);
      if (selectedStudent) {
        await fetchSanctions({ student_id: selectedStudent.id });
      } else if (userInfo?.role === "student") {
        await fetchSanctions();
      }
    }
  };

  const handleSubmit = async (
    data: NewDisciplinarySanction | { disciplinary_sanction_id: number; updateData: UpdateDisciplinarySanction }
  ) => {
    if ("disciplinary_sanction_id" in data) {
      await handleUpdateSanction(data);
    } else {
      await handleCreateSanction(data);
    }
  };

  const currentStudentName = () => {
    if (userInfo?.role === "student") {
      return userInfo.full_name || `${userInfo.name} ${userInfo.last_name}`;
    }
    if (selectedStudent) {
      return selectedStudent.full_name;
    }
    return undefined;
  };

  const thisMonthCount = sanctions.filter((s) => {
    const sanctionDate = parseLocalDate(s.date);
    const now = new Date();
    return sanctionDate.getMonth() === now.getMonth() && sanctionDate.getFullYear() === now.getFullYear();
  }).length;

  if (isLoadingSelection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shouldShowSelectors && currentStep !== "course" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={currentStep === "content" ? handleBackToStudent : handleBackToCourse}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="page-title">Conducta</h1>
              <p className="page-subtitle">
                {currentStep === "course"
                  ? "Selecciona un curso"
                  : currentStep === "student"
                  ? "Selecciona un estudiante"
                  : "Registro disciplinario"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {academicYears.length > 1 && (
              <AcademicYearSelector
                academicYears={academicYears}
                selectedYearId={selectedYearId}
                onYearChange={setSelectedYearId}
              />
            )}
            {currentStep === "content" && canCreate && !showForm && !editingSanction && selectedStudent && (
              <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Nueva sancion
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Course selector */}
      {shouldShowSelectors && currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
        />
      )}

      {/* Student selector */}
      {shouldShowSelectors && currentStep === "student" && (
        <StudentSelector
          students={students}
          onStudentSelect={handleStudentSelect}
          onBack={handleBackToCourse}
          selectedStudentId={selectedStudentId}
        />
      )}

      {/* Content */}
      {currentStep === "content" && (
        <>
          {/* Stats card */}
          {currentStudentName() && (
            <div className="sacred-card">

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Estudiante:</span>
                  <span className="sacred-badge sacred-badge-info">{currentStudentName()}</span>
                </div>

              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">{sanctions.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{thisMonthCount}</p>
                  <p className="text-xs text-muted-foreground">Este mes</p>
                </div>
                <div>
                  <p className="text-sm">
                    {sanctions.length > 0
                      ? parseLocalDate(
                          sanctions.reduce((latest, s) =>
                            parseLocalDate(s.date).getTime() > parseLocalDate(latest.date).getTime()
                              ? s
                              : latest
                          ).date
                        ).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                      : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Mas reciente</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {(showForm || editingSanction) && (
            <SanctionForm
              studentId={userInfo?.role === "student" ? userInfo.id : selectedStudent?.id}
              studentName={currentStudentName()}
              initialData={editingSanction || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingSanction(null);
              }}
              isLoading={isLoadingSanctions}
            />
          )}

          {/* Error */}
          {error && (
            <div className="sacred-card text-center py-8">
              <p className="text-destructive text-sm">{error}</p>
            </div>

          )}

          {/* Loading */}
          {isLoadingSanctions && !showForm && !editingSanction && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          )}

          {/* Sanctions list */}
          {!isLoadingSanctions && !error && !showForm && !editingSanction && (
            <SanctionDisplay
              sanctions={sanctions}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={setEditingSanction}
              onDelete={setSanctionToDelete}
              studentName={currentStudentName()}
            />
          )}
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!sanctionToDelete} onOpenChange={(open) => !open && setSanctionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar sancion?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La sancion sera eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSanction}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ConductaPage() {
  return (
    <ProtectedPage>
      <ConductaContent />
    </ProtectedPage>
  );
}
