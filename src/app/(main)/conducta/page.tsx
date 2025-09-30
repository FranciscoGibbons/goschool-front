"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ShieldExclamationIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useDisciplinarySanctions } from "@/hooks/useDisciplinarySanctions";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import { SanctionDisplay, SanctionForm } from "./components";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingPage, LoadingCard } from "@/components/ui/loading-spinner";
import { SkeletonList } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DisciplinarySanction, 
  NewDisciplinarySanction, 
  UpdateDisciplinarySanction 
} from "@/types/disciplinarySanction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    setSelectedStudentId
  } = useCourseStudentSelection(userInfo?.role || null);
  
  const {
    sanctions,
    isLoading: isLoadingSanctions,
    error,
    fetchSanctions,
    createSanction,
    updateSanction,
    deleteSanction
  } = useDisciplinarySanctions();

  const [showForm, setShowForm] = useState(false);
  const [editingSanction, setEditingSanction] = useState<DisciplinarySanction | null>(null);
  const [sanctionToDelete, setSanctionToDelete] = useState<DisciplinarySanction | null>(null);
  const [currentStep, setCurrentStep] = useState<"course" | "student" | "content">("course");

  // Determinar permisos según el rol
  const canCreate = userInfo?.role === 'admin' || userInfo?.role === 'preceptor';
  const canEdit = userInfo?.role === 'admin' || userInfo?.role === 'preceptor';
  const canDelete = userInfo?.role === 'admin' || userInfo?.role === 'preceptor';
  const canView = true; // Todos pueden ver

  // Determinar si se debe mostrar los selectores (todos excepto student y father)
  const shouldShowSelectors = userInfo?.role !== 'student' && userInfo?.role !== 'father';

  // Determinar si se puede crear una sanción (necesita estudiante seleccionado)
  const canCreateSanction = (canCreate && selectedStudent) || (userInfo?.role === 'student');

  // Manejar los pasos de navegación
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

  // Para estudiantes y padres, saltar directamente al contenido
  React.useEffect(() => {
    if (userInfo?.role === 'student' || userInfo?.role === 'father') {
      setCurrentStep("content");
    } else if (!shouldShowSelectors) {
      setCurrentStep("content");
    } else {
      setCurrentStep("course");
    }
  }, [userInfo?.role, shouldShowSelectors]);

  // Cargar sanciones cuando cambia la selección
  useEffect(() => {
    if (!canView) return;
    
    if (userInfo?.role === 'student') {
      // Los estudiantes solo ven sus propias sanciones
      fetchSanctions();
    } else if (userInfo?.role === 'father') {
      // Los padres ven las sanciones del hijo seleccionado
      if (selectedChild) {
        fetchSanctions({ student_id: selectedChild.id });
      } else {
        fetchSanctions();
      }
    } else if (selectedStudent) {
      // Otros roles ven las sanciones del estudiante seleccionado
      fetchSanctions({ student_id: selectedStudent.id });
    }
  }, [selectedStudent, selectedChild, userInfo, canView, fetchSanctions]);

  const handleCreateSanction = async (data: NewDisciplinarySanction) => {
    const success = await createSanction(data);
    if (success) {
      setShowForm(false);
      // Recargar las sanciones
      if (selectedStudent) {
        await fetchSanctions({ student_id: selectedStudent.id });
      } else if (userInfo?.role === 'student') {
        await fetchSanctions();
      }
    }
  };

  const handleUpdateSanction = async (data: { disciplinary_sanction_id: number; updateData: UpdateDisciplinarySanction }) => {
    const success = await updateSanction(data.disciplinary_sanction_id, data.updateData);
    if (success) {
      setEditingSanction(null);
      // Recargar las sanciones
      if (selectedStudent) {
        await fetchSanctions({ student_id: selectedStudent.id });
      } else if (userInfo?.role === 'student') {
        await fetchSanctions();
      }
    }
  };

  const handleDeleteSanction = async () => {
    if (!sanctionToDelete) return;
    
    const success = await deleteSanction(sanctionToDelete.disciplinary_sanction_id);
    if (success) {
      setSanctionToDelete(null);
      // Recargar las sanciones
      if (selectedStudent) {
        await fetchSanctions({ student_id: selectedStudent.id });
      } else if (userInfo?.role === 'student') {
        await fetchSanctions();
      }
    }
  };

  const handleSubmit = async (data: NewDisciplinarySanction | { disciplinary_sanction_id: number; updateData: UpdateDisciplinarySanction }) => {
    if ('disciplinary_sanction_id' in data) {
      await handleUpdateSanction(data);
    } else {
      await handleCreateSanction(data);
    }
  };

  // Obtener el nombre del estudiante actual
  const currentStudentName = () => {
    if (userInfo?.role === 'student') {
      return userInfo.full_name || `${userInfo.name} ${userInfo.last_name}`;
    }
    if (selectedStudent) {
      return selectedStudent.full_name;
    }
    return undefined;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
            <ShieldExclamationIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conducta
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gestión de sanciones disciplinarias
            </p>
          </div>
        </div>
        {currentStep === "content" && canCreateSanction && !showForm && !editingSanction && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Sanción
          </Button>
        )}
      </div>

      {/* Selector de Curso */}
      {shouldShowSelectors && currentStep === "course" && (
        <ErrorBoundary
          fallback={
            <ErrorDisplay 
              error="Error al cargar los cursos"
              retry={handleBackToCourse}
            />
          }
        >
          <Suspense fallback={<LoadingCard />}>
            <CourseSelector
              courses={courses}
              onCourseSelect={handleCourseSelect}
              selectedCourseId={selectedCourseId}
              title="Selecciona un curso"
              description="Elige el curso para ver las sanciones disciplinarias"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Selector de Estudiante */}
      {shouldShowSelectors && currentStep === "student" && (
        <ErrorBoundary
          fallback={
            <ErrorDisplay 
              error="Error al cargar los estudiantes"
              retry={handleBackToCourse}
            />
          }
        >
          <Suspense fallback={<SkeletonList items={4} />}>
            <StudentSelector
              students={students}
              onStudentSelect={handleStudentSelect}
              onBack={handleBackToCourse}
              selectedStudentId={selectedStudentId}
              title="Selecciona un estudiante"
              description="Elige el estudiante para ver sus sanciones disciplinarias"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Contenido principal */}
      {currentStep === "content" && (
        <>
          {/* Información del estudiante actual */}
          {currentStudentName() && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      Registro Disciplinario
                    </CardTitle>
                    <Badge variant="secondary" className="px-3 py-1">
                      {currentStudentName()}
                    </Badge>
                  </div>
                  {shouldShowSelectors && (
                    <Button variant="outline" size="sm" onClick={handleBackToStudent}>
                      ← Volver
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Total de sanciones</p>
                    <p className="text-2xl font-bold">{sanctions.length}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Este mes</p>
                    <p className="text-2xl font-bold">
                      {sanctions.filter(s => {
                        const sanctionDate = new Date(s.date);
                        const now = new Date();
                        return sanctionDate.getMonth() === now.getMonth() && 
                               sanctionDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Más reciente</p>
                    <p className="text-sm">
                      {sanctions.length > 0 
                        ? new Date(Math.max(...sanctions.map(s => new Date(s.date).getTime()))).toLocaleDateString('es-ES')
                        : 'Sin registros'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario */}
          {(showForm || editingSanction) && (
            <SanctionForm
              studentId={userInfo?.role === 'student' ? userInfo.id : selectedStudent?.id}
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

          {/* Error Display */}
          {error && (
            <ErrorDisplay
              error={error}
              retry={() => {
                if (selectedStudent) {
                  fetchSanctions({ student_id: selectedStudent.id });
                } else if (userInfo?.role === 'student') {
                  fetchSanctions();
                }
              }}
            />
          )}

          {/* Loading State */}
          {(isLoadingSanctions || isLoadingSelection) && !showForm && !editingSanction && (
            <LoadingCard />
          )}

          {/* Lista de Sanciones */}
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

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!sanctionToDelete} onOpenChange={(open) => !open && setSanctionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sanción disciplinaria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sanción será eliminada permanentemente del registro del estudiante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSanction}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ConductaSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
            <ShieldExclamationIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Conducta</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de sanciones disciplinarias
            </p>
          </div>
        </div>
      </div>
      <SkeletonList items={3} />
    </div>
  );
}

function ConductaWithAuth() {
  const { isLoading } = useAuthRedirect();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ErrorBoundary fallback={<ErrorDisplay error="Error en la página de conducta" />}>
      <ConductaContent />
    </ErrorBoundary>
  );
}

export default function ConductaPage() {
  return (
    <Suspense fallback={<ConductaSkeleton />}>
      <ConductaWithAuth />
    </Suspense>
  );
}