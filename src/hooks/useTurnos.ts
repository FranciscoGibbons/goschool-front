import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  MeetingRequestWithNames,
  NewMeetingRequest,
  CancelMeetingRequest,
  MeetingRequestFilter,
} from "../types/turnos";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../types/pagination";

export function useMeetingRequests(filters?: MeetingRequestFilter, initialPagination?: PaginationParams) {
  const [requests, setRequests] = useState<MeetingRequestWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page || DEFAULT_PAGE,
    limit: initialPagination?.limit || DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const fetchRequests = useCallback(async (page?: number, limit?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page || pagination.page));
      params.set("limit", String(limit || pagination.limit));
      if (filters?.status) params.set("status", filters.status);
      if (filters?.requester_id) params.set("requester_id", String(filters.requester_id));
      if (filters?.receiver_id) params.set("receiver_id", String(filters.receiver_id));
      if (filters?.student_id) params.set("student_id", String(filters.student_id));

      const res = await fetch(`/api/proxy/turnos?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener solicitudes de reunión");
      const data: PaginatedResponse<MeetingRequestWithNames> = await res.json();
      setRequests(data.data);
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

  const createRequest = useCallback(async (data: NewMeetingRequest) => {
    try {
      const res = await fetch("/api/proxy/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al crear solicitud");
      }
      toast.success("Solicitud de reunión enviada");
      await fetchRequests();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
      return false;
    }
  }, [fetchRequests]);

  const acceptRequest = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/proxy/turnos/${id}/accept`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Error al aceptar solicitud");
      toast.success("Solicitud aceptada");
      await fetchRequests();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
      return false;
    }
  }, [fetchRequests]);

  const cancelRequest = useCallback(async (id: number, data?: CancelMeetingRequest) => {
    try {
      const res = await fetch(`/api/proxy/turnos/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });
      if (!res.ok) throw new Error("Error al cancelar solicitud");
      toast.success("Solicitud cancelada");
      await fetchRequests();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
      return false;
    }
  }, [fetchRequests]);

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
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    pagination,
    fetchRequests,
    createRequest,
    acceptRequest,
    cancelRequest,
    goToPage,
    nextPage,
    prevPage,
  };
}
