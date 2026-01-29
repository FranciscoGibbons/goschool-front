import { useState, useCallback } from "react";
import {
  DisciplinarySanction,
  NewDisciplinarySanction,
  UpdateDisciplinarySanction,
  DisciplinarySanctionFilter
} from "@/types/disciplinarySanction";
import { toast } from "sonner";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "@/types/pagination";

const API_BASE = "/api/proxy/disciplinary-sanction";

export function useDisciplinarySanctions(initialPagination?: PaginationParams) {
  const [sanctions, setSanctions] = useState<DisciplinarySanction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page ?? DEFAULT_PAGE,
    limit: initialPagination?.limit ?? DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const fetchSanctions = useCallback(async (filter?: DisciplinarySanctionFilter, paginationParams?: PaginationParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Add pagination params
      const page = paginationParams?.page ?? pagination.page;
      const limit = paginationParams?.limit ?? pagination.limit;
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filter?.disciplinary_sanction_id) {
        params.append('disciplinary_sanction_id', filter.disciplinary_sanction_id.toString());
      }
      if (filter?.student_id) {
        params.append('student_id', filter.student_id.toString());
      }
      if (filter?.sanction_type) {
        params.append('sanction_type', filter.sanction_type);
      }
      if (filter?.academic_year_id) {
        params.append('academic_year_id', filter.academic_year_id.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/?${queryString}` : `${API_BASE}/`;

      console.log('Fetching sanctions from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.status === 404) {
        console.warn('Endpoint returned 404, treating as empty list');
        setSanctions([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const data = await response.json();
      console.log('Sanctions data received:', data);

      // Handle paginated response
      if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
        const paginatedData = data as PaginatedResponse<DisciplinarySanction>;
        setSanctions(paginatedData.data);
        setPagination({
          page: paginatedData.page,
          limit: paginatedData.limit,
          total: paginatedData.total,
          totalPages: paginatedData.total_pages,
        });
      } else {
        // Fallback for non-paginated response
        setSanctions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSanctions([]);
      console.error('Error fetching sanctions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const createSanction = useCallback(async (newSanction: NewDisciplinarySanction) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convertir fecha a formato YYYY-MM-DD si no está en ese formato
      const formattedSanction = {
        ...newSanction,
        date: newSanction.date.includes('T') 
          ? newSanction.date.split('T')[0] 
          : newSanction.date
      };

      console.log('=== CREATE SANCTION REQUEST ===');
      console.log('URL:', `${API_BASE}/`);
      console.log('Method: POST');
      console.log('Original data:', newSanction);
      console.log('Formatted data:', formattedSanction);

      const response = await fetch(`${API_BASE}/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedSanction),
      });

      console.log('CREATE Response status:', response.status);
      console.log('CREATE Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CREATE Response error text:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const responseData = await response.json();
      console.log('CREATE Response data:', responseData);
      console.log('==============================');

      toast.success('Sanción disciplinaria creada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al crear la sanción: ${errorMessage}`);
      console.error('Error creating sanction:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSanction = useCallback(async (id: number, updateData: UpdateDisciplinarySanction) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convertir fecha a formato YYYY-MM-DD si no está en ese formato
      const formattedData = {
        ...updateData,
        date: updateData.date.includes('T') 
          ? updateData.date.split('T')[0] 
          : updateData.date
      };

      const url = `${API_BASE}/${id}`;
      console.log('=== UPDATE SANCTION REQUEST ===');
      console.log('URL:', url);
      console.log('Method: PUT');
      console.log('ID:', id);
      console.log('Original data:', updateData);
      console.log('Formatted data:', formattedData);

      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      console.log('UPDATE Response status:', response.status);
      console.log('UPDATE Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('UPDATE Response error text:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const responseData = await response.json();
      console.log('UPDATE Response data:', responseData);
      console.log('===============================');

      toast.success('Sanción disciplinaria actualizada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al actualizar la sanción: ${errorMessage}`);
      console.error('Error updating sanction:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSanction = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `${API_BASE}/${id}`;
      console.log('=== DELETE SANCTION REQUEST ===');
      console.log('URL:', url);
      console.log('Method: DELETE');
      console.log('ID:', id);

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('DELETE Response status:', response.status);
      console.log('DELETE Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DELETE Response error text:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const responseData = await response.text();
      console.log('DELETE Response data:', responseData);
      console.log('===============================');

      toast.success('Sanción disciplinaria eliminada exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al eliminar la sanción: ${errorMessage}`);
      console.error('Error deleting sanction:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pagination controls
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchSanctions(undefined, { page, limit: pagination.limit });
    }
  }, [fetchSanctions, pagination.totalPages, pagination.limit]);

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
    fetchSanctions(undefined, { page: 1, limit });
  }, [fetchSanctions]);

  return {
    sanctions,
    isLoading,
    error,
    pagination,
    fetchSanctions,
    createSanction,
    updateSanction,
    deleteSanction,
    setSanctions,
    setError,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}