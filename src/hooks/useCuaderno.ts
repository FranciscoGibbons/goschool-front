import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  CircularWithStats,
  NewCircular,
  UpdateCircular,
  CircularFilter,
  ConfirmationDashboard,
  AutorizacionWithStats,
  NewAutorizacion,
  UpdateAutorizacion,
  NewAutorizacionResponse,
  AutorizacionFilter,
  AutorizacionResponseWithNames,
  NotaIndividualWithNames,
  NewNotaIndividual,
  ReplyNotaIndividual,
  NotaIndividualFilter,
} from "../types/cuaderno";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../types/pagination";

// ============================================================================
// CIRCULARES HOOK
// ============================================================================

export function useCirculares(filters?: CircularFilter, initialPagination?: PaginationParams) {
  const [circulares, setCirculares] = useState<CircularWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page ?? DEFAULT_PAGE,
    limit: initialPagination?.limit ?? DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const doFetch = useCallback(async (filtersToUse?: CircularFilter, paginationParams?: PaginationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      const page = paginationParams?.page ?? pagination.page;
      const limit = paginationParams?.limit ?? pagination.limit;
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (filtersToUse?.course_id) queryParams.append("course_id", filtersToUse.course_id.toString());

      const url = `/api/proxy/circulares?${queryParams.toString()}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      if (data && "data" in data && "total" in data) {
        const paginatedData = data as PaginatedResponse<CircularWithStats>;
        setCirculares(paginatedData.data);
        setPagination({ page: paginatedData.page, limit: paginatedData.limit, total: paginatedData.total, totalPages: paginatedData.total_pages });
      } else {
        setCirculares(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar circulares";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchCirculares = useCallback(async (customFilters?: CircularFilter) => {
    await doFetch(customFilters || filters);
  }, [doFetch, filters]);

  useEffect(() => {
    doFetch(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, filters?.course_id]);

  const createCircular = useCallback(async (data: NewCircular): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/circulares", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Circular creada correctamente");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear circular");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const updateCircular = useCallback(async (id: number, data: UpdateCircular): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/circulares/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Circular actualizada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar circular");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const deleteCircular = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/circulares/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Circular eliminada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar circular");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const confirmCircular = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/proxy/circulares/${id}/confirm`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Circular confirmada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al confirmar circular");
      return false;
    }
  }, [doFetch, filters]);

  const getConfirmations = useCallback(async (id: number): Promise<ConfirmationDashboard | null> => {
    try {
      const response = await fetch(`/api/proxy/circulares/${id}/confirmations`, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al obtener confirmaciones");
      return null;
    }
  }, []);

  const sendReminder = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/proxy/circulares/${id}/reminder`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Recordatorios enviados");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar recordatorios");
      return false;
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) doFetch(filters, { page, limit: pagination.limit });
  }, [doFetch, filters, pagination.totalPages, pagination.limit]);

  const nextPage = useCallback(() => { if (pagination.page < pagination.totalPages) goToPage(pagination.page + 1); }, [goToPage, pagination.page, pagination.totalPages]);
  const prevPage = useCallback(() => { if (pagination.page > 1) goToPage(pagination.page - 1); }, [goToPage, pagination.page]);

  return {
    circulares, isLoading, error, pagination,
    fetchCirculares, createCircular, updateCircular, deleteCircular,
    confirmCircular, getConfirmations, sendReminder,
    goToPage, nextPage, prevPage,
  };
}

// ============================================================================
// AUTORIZACIONES HOOK
// ============================================================================

export function useAutorizaciones(filters?: AutorizacionFilter, initialPagination?: PaginationParams) {
  const [autorizaciones, setAutorizaciones] = useState<AutorizacionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page ?? DEFAULT_PAGE,
    limit: initialPagination?.limit ?? DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const doFetch = useCallback(async (filtersToUse?: AutorizacionFilter, paginationParams?: PaginationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      const page = paginationParams?.page ?? pagination.page;
      const limit = paginationParams?.limit ?? pagination.limit;
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (filtersToUse?.course_id) queryParams.append("course_id", filtersToUse.course_id.toString());

      const url = `/api/proxy/autorizaciones?${queryParams.toString()}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      if (data && "data" in data && "total" in data) {
        const paginatedData = data as PaginatedResponse<AutorizacionWithStats>;
        setAutorizaciones(paginatedData.data);
        setPagination({ page: paginatedData.page, limit: paginatedData.limit, total: paginatedData.total, totalPages: paginatedData.total_pages });
      } else {
        setAutorizaciones(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar autorizaciones";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchAutorizaciones = useCallback(async (customFilters?: AutorizacionFilter) => {
    await doFetch(customFilters || filters);
  }, [doFetch, filters]);

  useEffect(() => {
    doFetch(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, filters?.course_id]);

  const createAutorizacion = useCallback(async (data: NewAutorizacion): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/autorizaciones", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Autorizacion creada correctamente");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear autorizacion");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const updateAutorizacion = useCallback(async (id: number, data: UpdateAutorizacion): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/autorizaciones/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Autorizacion actualizada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar autorizacion");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const deleteAutorizacion = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/autorizaciones/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Autorizacion eliminada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar autorizacion");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const respondAutorizacion = useCallback(async (data: NewAutorizacionResponse): Promise<boolean> => {
    try {
      const response = await fetch("/api/proxy/autorizaciones/respond", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success(data.status === "accepted" ? "Autorizacion aceptada" : "Autorizacion rechazada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al responder autorizacion");
      return false;
    }
  }, [doFetch, filters]);

  const getResponses = useCallback(async (id: number): Promise<AutorizacionResponseWithNames[] | null> => {
    try {
      const response = await fetch(`/api/proxy/autorizaciones/${id}/responses`, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al obtener respuestas");
      return null;
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) doFetch(filters, { page, limit: pagination.limit });
  }, [doFetch, filters, pagination.totalPages, pagination.limit]);

  const nextPage = useCallback(() => { if (pagination.page < pagination.totalPages) goToPage(pagination.page + 1); }, [goToPage, pagination.page, pagination.totalPages]);
  const prevPage = useCallback(() => { if (pagination.page > 1) goToPage(pagination.page - 1); }, [goToPage, pagination.page]);

  return {
    autorizaciones, isLoading, error, pagination,
    fetchAutorizaciones, createAutorizacion, updateAutorizacion, deleteAutorizacion,
    respondAutorizacion, getResponses,
    goToPage, nextPage, prevPage,
  };
}

// ============================================================================
// NOTAS INDIVIDUALES HOOK
// ============================================================================

export function useNotasIndividuales(filters?: NotaIndividualFilter, initialPagination?: PaginationParams) {
  const [notas, setNotas] = useState<NotaIndividualWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPagination?.page ?? DEFAULT_PAGE,
    limit: initialPagination?.limit ?? DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const doFetch = useCallback(async (filtersToUse?: NotaIndividualFilter, paginationParams?: PaginationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      const page = paginationParams?.page ?? pagination.page;
      const limit = paginationParams?.limit ?? pagination.limit;
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (filtersToUse?.student_id) queryParams.append("student_id", filtersToUse.student_id.toString());

      const url = `/api/proxy/notas-individuales?${queryParams.toString()}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      if (data && "data" in data && "total" in data) {
        const paginatedData = data as PaginatedResponse<NotaIndividualWithNames>;
        setNotas(paginatedData.data);
        setPagination({ page: paginatedData.page, limit: paginatedData.limit, total: paginatedData.total, totalPages: paginatedData.total_pages });
      } else {
        setNotas(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar notas individuales";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchNotas = useCallback(async (customFilters?: NotaIndividualFilter) => {
    await doFetch(customFilters || filters);
  }, [doFetch, filters]);

  useEffect(() => {
    doFetch(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, filters?.student_id]);

  const createNota = useCallback(async (data: NewNotaIndividual): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/notas-individuales", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Nota individual creada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear nota");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const replyNota = useCallback(async (id: number, data: ReplyNotaIndividual): Promise<boolean> => {
    try {
      const response = await fetch(`/api/proxy/notas-individuales/${id}/reply`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Respuesta enviada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al responder nota");
      return false;
    }
  }, [doFetch, filters]);

  const deleteNota = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/notas-individuales/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Nota eliminada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar nota");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) doFetch(filters, { page, limit: pagination.limit });
  }, [doFetch, filters, pagination.totalPages, pagination.limit]);

  const nextPage = useCallback(() => { if (pagination.page < pagination.totalPages) goToPage(pagination.page + 1); }, [goToPage, pagination.page, pagination.totalPages]);
  const prevPage = useCallback(() => { if (pagination.page > 1) goToPage(pagination.page - 1); }, [goToPage, pagination.page]);

  return {
    notas, isLoading, error, pagination,
    fetchNotas, createNota, replyNota, deleteNota,
    goToPage, nextPage, prevPage,
  };
}
