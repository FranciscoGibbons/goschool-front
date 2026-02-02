import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { 
  Submission, 
  NewSubmission, 
  UpdateSubmission, 
  SubmissionFilter 
} from "@/types/submission";
import { validateFile } from "@/types/submission";

export function useSubmissions(filters?: SubmissionFilter) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener submissions
  const fetchSubmissions = useCallback(async (customFilters?: SubmissionFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      const currentFilters = customFilters || filters;
      
      if (currentFilters) {
        if (currentFilters.student_id) {
          queryParams.append("student_id", currentFilters.student_id.toString());
        }
        if (currentFilters.task_id) {
          queryParams.append("task_id", currentFilters.task_id.toString());
        }
        if (currentFilters.subject_id) {
          queryParams.append("subject_id", currentFilters.subject_id.toString());
        }
        if (currentFilters.course_id) {
          queryParams.append("course_id", currentFilters.course_id.toString());
        }
        if (currentFilters.academic_year_id) {
          queryParams.append("academic_year_id", currentFilters.academic_year_id.toString());
        }
      }
      
      const queryString = queryParams.toString();
      const url = `/api/proxy/submissions${queryString ? `?${queryString}` : ""}`;
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setSubmissions(items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar entregas";
      setError(errorMessage);
      console.error("Error fetching submissions:", err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Función para crear nueva submission
  const createSubmission = useCallback(async (newSubmission: NewSubmission): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Validar archivo
      const validation = validateFile(newSubmission.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const formData = new FormData();
      formData.append("student_id", newSubmission.student_id.toString());
      formData.append("homework_id", newSubmission.task_id.toString());
      formData.append("file", newSubmission.file);

      const response = await fetch("/api/proxy/submissions", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Entrega subida correctamente");
      await fetchSubmissions(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al subir entrega";
      console.error("Error creating submission:", err);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubmissions]);

  // Función para actualizar submission
  const updateSubmission = useCallback(async (
    submissionId: number, 
    updateData: UpdateSubmission
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/proxy/submissions/${submissionId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Entrega actualizada correctamente");
      await fetchSubmissions(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar entrega";
      console.error("Error updating submission:", err);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubmissions]);

  // Función para eliminar submission
  const deleteSubmission = useCallback(async (submissionId: number): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/proxy/submissions/${submissionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Entrega eliminada correctamente");
      await fetchSubmissions(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar entrega";
      console.error("Error deleting submission:", err);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubmissions]);

  // Función para descargar archivo de submission
  const downloadSubmission = useCallback(async (submission: Submission): Promise<void> => {
    try {
      // El path ya contiene la URL completa del archivo
      const downloadUrl = submission.path;

      // Crear enlace de descarga directa
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = submission.path.split("/").pop() || "archivo";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);

      toast.success("Archivo descargado");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al descargar archivo";
      console.error("Error downloading submission:", err);
      toast.error(errorMessage);
    }
  }, []);

  // Cargar submissions al montar el componente o cambiar filtros
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    isLoading,
    error,
    fetchSubmissions,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    downloadSubmission,
  };
}