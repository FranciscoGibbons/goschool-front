import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  ObservacionWithNames,
  NewObservacion,
  ReplyObservacion,
  ObservacionFilter,
} from "../types/observaciones";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../types/pagination";

export function useObservaciones(filters?: ObservacionFilter, initialPagination?: PaginationParams) {
  const [observaciones, setObservaciones] = useState<ObservacionWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page || DEFAULT_PAGE,
    limit: initialPagination?.limit || DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const fetchObservaciones = useCallback(async (page?: number, limit?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page || pagination.page));
      params.set("limit", String(limit || pagination.limit));
      if (filters?.student_id) params.set("student_id", String(filters.student_id));
      if (filters?.sender_id) params.set("sender_id", String(filters.sender_id));
      if (filters?.observacion_id) params.set("observacion_id", String(filters.observacion_id));

      const res = await fetch(`/api/proxy/observaciones?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener observaciones");
      const data: PaginatedResponse<ObservacionWithNames> = await res.json();
      setObservaciones(data.data);
      setPagination(prev => ({
        ...prev,
        page: data.page,
        total: data.total,
        totalPages: data.total_pages,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const createObservacion = useCallback(async (data: NewObservacion) => {
    try {
      const res = await fetch("/api/proxy/observaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al crear observación");
      }
      toast.success("Observación creada");
      await fetchObservaciones();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
      return false;
    }
  }, [fetchObservaciones]);

  const replyObservacion = useCallback(async (id: number, data: ReplyObservacion) => {
    try {
      const res = await fetch(`/api/proxy/observaciones/${id}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al responder observación");
      toast.success("Respuesta registrada");
      await fetchObservaciones();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
      return false;
    }
  }, [fetchObservaciones]);

  const deleteObservacion = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/proxy/observaciones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar observación");
      toast.success("Observación eliminada");
      await fetchObservaciones();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
      return false;
    }
  }, [fetchObservaciones]);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => {
      if (prev.page < prev.totalPages) return { ...prev, page: prev.page + 1 };
      return prev;
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => {
      if (prev.page > 1) return { ...prev, page: prev.page - 1 };
      return prev;
    });
  }, []);

  useEffect(() => {
    fetchObservaciones();
  }, [fetchObservaciones]);

  return {
    observaciones,
    isLoading,
    error,
    pagination,
    fetchObservaciones,
    createObservacion,
    replyObservacion,
    deleteObservacion,
    goToPage,
    nextPage,
    prevPage,
  };
}
