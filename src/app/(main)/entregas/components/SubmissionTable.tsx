"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  ChevronLeftIcon, 
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import {
  Button,
  Badge,
  Card,
  CardContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  LoadingSpinner,
} from "@/components/sacred";

import userInfoStore from "@/store/userInfoStore";
import type { Submission } from "@/types/submission";
import { getFileIcon } from "@/types/submission";

interface SubmissionTableProps {
  submissions: Submission[];
  onEdit: (submission: Submission) => void;
  onDelete: (submissionId: number) => void;
  onDownload: (submission: Submission) => void;
  isLoading: boolean;
}

export function SubmissionTable({ 
  submissions, 
  onEdit, 
  onDelete, 
  onDownload,
  isLoading 
}: SubmissionTableProps) {
  const { userInfo } = userInfoStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const canEdit = userInfo?.role === "admin" || userInfo?.role === "preceptor" || userInfo?.role === "teacher";
  const canDelete = userInfo?.role === "admin" || userInfo?.role === "student";

  // Paginación
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubmissions = submissions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getStatusBadge = (submission: Submission) => {
    if (!submission.due_date) {
      return <Badge variant="neutral">Sin fecha límite</Badge>;
    }

    const dueDate = new Date(submission.due_date);
    const submittedDate = new Date(submission.submitted_at);

    if (submittedDate <= dueDate) {
      return <Badge variant="success">A tiempo</Badge>;
    } else {
      return <Badge variant="error">Tardía</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-text-secondary">
            <EyeIcon className="mx-auto h-12 w-12 mb-4 opacity-50 text-text-muted" />
            <h3 className="text-lg font-medium mb-2 text-text-primary">No hay entregas</h3>
            <p className="text-sm text-text-secondary">No se encontraron entregas que coincidan con los filtros aplicados.</p>
          </div>

        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          {/* Vista Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-muted border-b">

                <tr>
                  <th className="text-left p-4 font-medium">Archivo</th>
                  <th className="text-left p-4 font-medium">Estudiante</th>
                  <th className="text-left p-4 font-medium">Tarea</th>
                  <th className="text-left p-4 font-medium">Fecha de Entrega</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((submission) => {
                  const fileName = submission.path.split("/").pop() || "archivo";
                  const fileIcon = getFileIcon(fileName);
                  
                  return (
                    <tr key={submission.id} className="border-b hover:bg-surface-muted">

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{fileIcon}</span>
                          <div>
                            <p className="font-medium">{fileName}</p>
                            <p className="text-sm text-text-secondary">
                              {submission.assessment_type && (
                                <span className="capitalize">{submission.assessment_type}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">
                            {submission.student_full_name || 
                             `${submission.student_name || ""} ${submission.student_last_name || ""}`.trim() ||
                             `Estudiante ID: ${submission.student_id}`}
                          </p>
                          {submission.course_name && (
                            <p className="text-sm text-text-secondary">
                              {submission.course_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{submission.task_name || `Tarea ID: ${submission.task_id}`}</p>
                          {submission.subject_name && (
                            <p className="text-sm text-text-secondary">
                              {submission.subject_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {format(new Date(submission.submitted_at), "dd 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {format(new Date(submission.submitted_at), "HH:mm", { locale: es })}
                        </p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(submission)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownload(submission)}
                            className="h-8 w-8 p-0"
                            title="Descargar archivo"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(submission)}
                              className="h-8 w-8 p-0"
                              title="Editar entrega"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (userInfo?.role === "admin" || submission.student_id === userInfo?.id) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  title="Eliminar entrega"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar entrega?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. La entrega será eliminada permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(submission.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vista Mobile */}
          <div className="md:hidden space-y-4 p-4">
            {currentSubmissions.map((submission) => {
              const fileName = submission.path.split("/").pop() || "archivo";
              const fileIcon = getFileIcon(fileName);
              
              return (
                <Card key={submission.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{fileIcon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{fileName}</p>
                        <p className="text-sm text-text-secondary">
                          {submission.task_name || `Tarea ID: ${submission.task_id}`}
                        </p>
                        {submission.subject_name && (
                          <p className="text-sm text-text-secondary">
                            {submission.subject_name}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(submission)}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">
                        {submission.student_full_name || 
                         `${submission.student_name || ""} ${submission.student_last_name || ""}`.trim() ||
                         `Estudiante ID: ${submission.student_id}`}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Entregado: {format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(submission)}
                        className="flex-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(submission)}
                          className="flex-1"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      {canDelete && (userInfo?.role === "admin" || submission.student_id === userInfo?.id) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar entrega?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La entrega será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(submission.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Mostrando {startIndex + 1} a {Math.min(endIndex, submissions.length)} de {submissions.length} entregas
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3 py-1 bg-muted rounded">
              {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}