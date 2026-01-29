import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  Assistance,
  NewAssistance,
  UpdateAssistance,
  AssistanceFilter
} from "../types/assistance";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../types/pagination";

export function useAssistance(filters?: AssistanceFilter, initialPagination?: PaginationParams) {
  const [assistances, setAssistances] = useState<Assistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page ?? DEFAULT_PAGE,
    limit: initialPagination?.limit ?? DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  // Función interna para fetch que no se recrea
  const doFetch = useCallback(async (filtersToUse?: AssistanceFilter, paginationParams?: PaginationParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      const page = paginationParams?.page ?? pagination.page;
      const limit = paginationParams?.limit ?? pagination.limit;
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (filtersToUse) {
        if (filtersToUse.assistance_id) {
          queryParams.append("assistance_id", filtersToUse.assistance_id.toString());
        }
        if (filtersToUse.student_id) {
          queryParams.append("student_id", filtersToUse.student_id.toString());
        }
        if (filtersToUse.presence) {
          queryParams.append("presence", filtersToUse.presence);
        }
        if (filtersToUse.date) {
          queryParams.append("date", filtersToUse.date);
        }
        if (filtersToUse.academic_year_id) {
          queryParams.append("academic_year_id", filtersToUse.academic_year_id.toString());
        }
      }

      const queryString = queryParams.toString();
      const url = `/api/proxy/assistance${queryString ? `?${queryString}` : ""}`;

      console.log("Fetching assistances from:", url); // Debug log

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
      console.log("Assistances data received:", data); // Debug log

      // Handle paginated response
      if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
        const paginatedData = data as PaginatedResponse<Assistance>;
        setAssistances(paginatedData.data);
        setPagination({
          page: paginatedData.page,
          limit: paginatedData.limit,
          total: paginatedData.total,
          totalPages: paginatedData.total_pages,
        });
      } else {
        // Fallback for non-paginated response (backwards compatibility)
        setAssistances(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar asistencias";
      setError(errorMessage);
      console.error("Error fetching assistances:", err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Función pública para refetch
  const fetchAssistances = useCallback(async (customFilters?: AssistanceFilter) => {
    await doFetch(customFilters || filters);
  }, [doFetch, filters]);

  // Cargar asistencias al montar el componente - directamente con doFetch
  useEffect(() => {
    console.log("useAssistance effect triggered with filters:", filters); // Debug log
    doFetch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, filters?.student_id, filters?.assistance_id, filters?.presence, filters?.date, filters?.academic_year_id]);

  // Función para validar si ya existe asistencia para la misma fecha y estudiante
  const checkExistingAssistance = useCallback(async (studentId: number, date: string): Promise<Assistance | null> => {
    try {
      // Asegurar que la fecha esté en formato YYYY-MM-DD sin zona horaria
      const formattedDate = date.includes('T') ? date.split('T')[0] : date;
      
      console.log('🔍 Checking existing assistance for:', {
        studentId,
        originalDate: date,
        formattedDate
      });

      const queryParams = new URLSearchParams();
      queryParams.append("student_id", studentId.toString());
      queryParams.append("date", formattedDate);
      
      const url = `/api/proxy/assistance?${queryParams.toString()}`;
      console.log('🔍 Checking URL:', url);
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('🔍 Check response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        console.log('🔍 Check response not ok, allowing creation');
        return null; // Si hay error, permitir crear (mejor que bloquear)
      }

      const data = await response.json();
      console.log('🔍 Existing assistances found:', data);

      // Handle paginated response
      let existingAssistances: Assistance[] = [];
      if (data && typeof data === 'object' && 'data' in data) {
        existingAssistances = (data as PaginatedResponse<Assistance>).data;
      } else {
        existingAssistances = Array.isArray(data) ? data : [];
      }

      // Retornar la primera asistencia encontrada para esa fecha y estudiante
      const found = existingAssistances.length > 0 ? existingAssistances[0] : null;
      console.log('🔍 Final result:', found ? 'FOUND EXISTING' : 'NO EXISTING');

      return found;
    } catch (err) {
      console.error("❌ Error checking existing assistance:", err);
      return null; // En caso de error, permitir crear
    }
  }, []);

  // Función para crear nueva asistencia
  const createAssistance = useCallback(async (newAssistance: NewAssistance): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Asegurar que la fecha esté en formato YYYY-MM-DD sin zona horaria
      const formattedDate = newAssistance.date.includes('T') 
        ? newAssistance.date.split('T')[0] 
        : newAssistance.date;

      console.log('📝 Creating assistance with:', {
        studentId: newAssistance.student_id,
        originalDate: newAssistance.date,
        formattedDate
      });

      // Verificar si ya existe una asistencia para esa fecha y estudiante
      const existingAssistance = await checkExistingAssistance(newAssistance.student_id, formattedDate);
      
      if (existingAssistance) {
        console.log('⚠️ Duplicate assistance detected:', existingAssistance);
        toast.error("Ya existe una asistencia registrada para este estudiante en esa fecha. Puedes editarla en su lugar.");
        return false;
      }

      const assistanceToCreate = {
        ...newAssistance,
        date: formattedDate
      };

      console.log('📝 Final assistance data to send:', assistanceToCreate);

      const response = await fetch("/api/proxy/assistance", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assistanceToCreate),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Asistencia registrada correctamente");
      
      // Recargar con los filtros específicos del estudiante creado
      const reloadFilters = { student_id: newAssistance.student_id };
      await doFetch(reloadFilters);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear asistencia";
      console.error("❌ Error creating assistance:", err);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, checkExistingAssistance]);

  // Función para actualizar asistencia
  const updateAssistance = useCallback(async (
    assistanceId: number, 
    updateData: UpdateAssistance
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Asegurar que la fecha esté en formato YYYY-MM-DD sin zona horaria
      const formattedUpdateData = {
        ...updateData,
        date: updateData.date.includes('T') ? updateData.date.split('T')[0] : updateData.date
      };

      console.log('✏️ Updating assistance with:', {
        assistanceId,
        originalDate: updateData.date,
        formattedDate: formattedUpdateData.date
      });

      const response = await fetch(`/api/proxy/assistance/${assistanceId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedUpdateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Asistencia actualizada correctamente");
      await doFetch(filters); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar asistencia";
      console.error("❌ Error updating assistance:", err);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  // Función para eliminar asistencia
  const deleteAssistance = useCallback(async (assistanceId: number): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const url = `/api/proxy/assistance/${assistanceId}`;
      console.log("DELETE request URL:", url); // Debug log
      console.log("Assistance ID to delete:", assistanceId); // Debug log
      
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("DELETE response status:", response.status); // Debug log
      console.log("DELETE response ok:", response.ok); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        console.error("DELETE error response:", errorData); // Debug log
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Asistencia eliminada correctamente");
      await doFetch(filters); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar asistencia";
      console.error("Error deleting assistance:", err);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  // Pagination controls
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      doFetch(filters, { page, limit: pagination.limit });
    }
  }, [doFetch, filters, pagination.totalPages, pagination.limit]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1);
    }
  }, [goToPage, pagination.page, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [goToPage, pagination.page]);

  const setPageSize = useCallback((limit: number) => {
    doFetch(filters, { page: 1, limit });
  }, [doFetch, filters]);

  return {
    assistances,
    isLoading,
    error,
    pagination,
    fetchAssistances,
    createAssistance,
    updateAssistance,
    deleteAssistance,
    checkExistingAssistance,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}