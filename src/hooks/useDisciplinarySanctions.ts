import { useState, useCallback } from "react";
import { 
  DisciplinarySanction, 
  NewDisciplinarySanction, 
  UpdateDisciplinarySanction,
  DisciplinarySanctionFilter 
} from "@/types/disciplinarySanction";
import { toast } from "sonner";

const API_BASE = "/api/proxy/disciplinary-sanction";

export function useDisciplinarySanctions() {
  const [sanctions, setSanctions] = useState<DisciplinarySanction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSanctions = useCallback(async (filter?: DisciplinarySanctionFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter?.disciplinary_sanction_id) {
        params.append('disciplinary_sanction_id', filter.disciplinary_sanction_id.toString());
      }
      if (filter?.student_id) {
        params.append('student_id', filter.student_id.toString());
      }
      if (filter?.sanction_type) {
        params.append('sanction_type', filter.sanction_type);
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
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 404) {
        // Si es 404, puede ser que no haya datos o que el endpoint no exista
        // Tratamos como lista vacía si es un error de "no encontrado"
        console.warn('Endpoint returned 404, treating as empty list');
        setSanctions([]);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const data = await response.json();
      console.log('Sanctions data received:', data);
      setSanctions(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSanctions([]);
      console.error('Error fetching sanctions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return {
    sanctions,
    isLoading,
    error,
    fetchSanctions,
    createSanction,
    updateSanction,
    deleteSanction,
    setSanctions,
    setError
  };
}