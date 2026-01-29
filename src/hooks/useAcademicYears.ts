import { useState, useEffect, useCallback } from 'react';
import { AcademicYear } from '@/types/academicYear';

interface UseAcademicYearsReturn {
  academicYears: AcademicYear[];
  activeYear: AcademicYear | null;
  selectedYearId: number | null;
  setSelectedYearId: (id: number | null) => void;
  isLoading: boolean;
  error: string | null;
}

export function useAcademicYears(): UseAcademicYearsReturn {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademicYears = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/academic_years/', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch academic years');
      const data: AcademicYear[] = await res.json();
      setAcademicYears(data);

      // Auto-select active year if none selected
      if (selectedYearId === null) {
        const active = data.find((y) => y.is_active);
        if (active) {
          setSelectedYearId(active.id);
        }
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYearId]);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const activeYear = academicYears.find((y) => y.is_active) || null;

  return {
    academicYears,
    activeYear,
    selectedYearId,
    setSelectedYearId,
    isLoading,
    error,
  };
}
