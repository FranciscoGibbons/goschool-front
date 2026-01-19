"use client";

import { useState, useEffect, useCallback } from "react";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  LoadingSpinner,
  Progress,
} from "@/components/sacred";

import { cn } from "@/lib/utils";
import type { NewSubmission } from "@/types/submission";
import { 
  validateFile, 
  getFileIcon, 
  formatFileSize, 
  ALLOWED_FILE_EXTENSIONS 
} from "@/types/submission";

interface SubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSubmission) => Promise<boolean>;
  selectedStudentId?: number;
  selectedTaskId?: number;
  availableTasks?: Array<{
    id: number;
    task: string;
    subject_name?: string;
    due_date?: string;
    type?: string;
  }>;
}

export function SubmissionForm({
  isOpen,
  onClose,
  onSubmit,
  selectedStudentId,
  selectedTaskId,
  availableTasks = [],
}: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form data
  const [taskId, setTaskId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Poblar formulario
  useEffect(() => {
    setTaskId(selectedTaskId || null);
    setSelectedFile(null);
    setFileError(null);
    setUploadProgress(0);
  }, [selectedTaskId, isOpen]);

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error || "Archivo no válido");
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudentId || !taskId || !selectedFile) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    // Simular progreso de subida
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData: NewSubmission = {
      student_id: selectedStudentId,
      task_id: taskId,
      file: selectedFile,
    };

    const success = await onSubmit(formData);
    
    clearInterval(progressInterval);
    setUploadProgress(100);
    
    if (success) {
      setTimeout(() => {
        handleClose();
      }, 500);
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setTaskId(selectedTaskId || null);
    setSelectedFile(null);
    setFileError(null);
    setUploadProgress(0);
    onClose();
  };

  const isFormValid = selectedStudentId && taskId && selectedFile && !fileError;

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Subir Entrega</ModalTitle>
            <ModalDescription>
              Selecciona la tarea y sube tu archivo de entrega.
            </ModalDescription>
          </ModalHeader>


          <div className="grid gap-6 py-4">
            {/* Selección de tarea */}
            {!selectedTaskId && (
              <div className="space-y-2">
                <Label htmlFor="task">Tarea</Label>
                <Select 
                  value={taskId?.toString() || ""} 
                  onValueChange={(value) => setTaskId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tarea" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.length > 0 ? (
                      availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          <div>
                            <p className="font-medium">{task.task}</p>
                            {task.subject_name && (
                              <p className="text-sm text-text-secondary">

                                {task.subject_name}
                                {task.due_date && ` - Vence: ${new Date(task.due_date).toLocaleDateString('es-ES')}`}
                              </p>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-center py-4 text-text-secondary">
                        No hay tareas disponibles
                      </div>
                    )}

                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Información de la tarea seleccionada */}
              {selectedTaskId && availableTasks.length > 0 && (
                <div className="p-4 bg-surface-muted rounded-lg">
                  {(() => {

                  const task = availableTasks.find(t => t.id === selectedTaskId);
                  return task ? (
                    <div>
                      <p className="font-medium">{task.task}</p>
                      {task.subject_name && (
                        <p className="text-sm text-text-secondary">{task.subject_name}</p>
                      )}
                      {task.due_date && (
                        <p className="text-sm text-text-secondary">
                          Fecha límite: {new Date(task.due_date).toLocaleDateString('es-ES')}
                        </p>
                      )}

                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Subida de archivo */}
            <div className="space-y-2">
              <Label>Archivo</Label>
              
              {!selectedFile ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragOver 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"

                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-text-muted mb-4" />

                  <p className="text-lg font-medium mb-2">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-text-secondary mb-4">

                    Formatos permitidos: {ALLOWED_FILE_EXTENSIONS.join(", ")}
                  </p>
                  <p className="text-xs text-text-secondary mb-4">

                    Tamaño máximo: 10MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-sm text-error">{fileError}</p>
              )}

            </div>

            {/* Progreso de subida */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subiendo archivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>

           <ModalFooter>
             <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
               Cancelar
             </Button>
             <Button 
               type="submit" 
               disabled={!isFormValid || isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <LoadingSpinner size="sm" className="mr-2" />
                   Subiendo...
                 </>
               ) : (
                 <>
                   <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                   Subir Entrega
                 </>
               )}
             </Button>
           </ModalFooter>
         </form>
       </ModalContent>
     </Modal>

  );
}