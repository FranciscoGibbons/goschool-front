import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  TeacherAvailability,
  NewTeacherAvailability,
  UpdateTeacherAvailability,
  NewTeacherBlockedSlot,
  AvailableSlot,
  MeetingBookingWithNames,
  NewMeetingBooking,
  CancelMeetingBooking,
  MeetingNotes,
  AvailabilityFilter,
  MeetingBookingFilter,
} from "../types/turnos";

// ============================================================================
// TEACHER AVAILABILITY HOOK
// ============================================================================

export function useTeacherAvailability(filters?: AvailabilityFilter) {
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async (filtersToUse?: AvailabilityFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filtersToUse?.teacher_id) queryParams.append("teacher_id", filtersToUse.teacher_id.toString());

      const url = `/api/proxy/turnos/availability?${queryParams.toString()}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar disponibilidad";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailability = useCallback(async (customFilters?: AvailabilityFilter) => {
    await doFetch(customFilters || filters);
  }, [doFetch, filters]);

  useEffect(() => {
    doFetch(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, filters?.teacher_id]);

  const createAvailability = useCallback(async (data: NewTeacherAvailability): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/turnos/availability", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Disponibilidad creada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear disponibilidad");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const updateAvailability = useCallback(async (id: number, data: UpdateTeacherAvailability): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/turnos/availability/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Disponibilidad actualizada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar disponibilidad");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const deleteAvailability = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/turnos/availability/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Disponibilidad eliminada");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar disponibilidad");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const createBlockedSlot = useCallback(async (data: NewTeacherBlockedSlot): Promise<boolean> => {
    try {
      const response = await fetch("/api/proxy/turnos/blocked", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Horario bloqueado");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al bloquear horario");
      return false;
    }
  }, []);

  const deleteBlockedSlot = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/proxy/turnos/blocked/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Bloqueo eliminado");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar bloqueo");
      return false;
    }
  }, []);

  return {
    availability, isLoading, error,
    fetchAvailability, createAvailability, updateAvailability, deleteAvailability,
    createBlockedSlot, deleteBlockedSlot,
  };
}

// ============================================================================
// AVAILABLE SLOTS HOOK
// ============================================================================

export function useAvailableSlots(teacherId?: number) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async (tid?: number) => {
    const id = tid || teacherId;
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/proxy/turnos/slots?teacher_id=${id}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar turnos disponibles";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) fetchSlots(teacherId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  return { slots, isLoading, error, fetchSlots };
}

// ============================================================================
// MEETING BOOKINGS HOOK
// ============================================================================

export function useMeetingBookings(filters?: MeetingBookingFilter) {
  const [bookings, setBookings] = useState<MeetingBookingWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async (filtersToUse?: MeetingBookingFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filtersToUse?.teacher_id) queryParams.append("teacher_id", filtersToUse.teacher_id.toString());

      const url = `/api/proxy/turnos/bookings?${queryParams.toString()}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar reservas";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async (customFilters?: MeetingBookingFilter) => {
    await doFetch(customFilters || filters);
  }, [doFetch, filters]);

  useEffect(() => {
    doFetch(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, filters?.teacher_id]);

  const createBooking = useCallback(async (data: NewMeetingBooking): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/turnos/bookings", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      toast.success("Turno reservado correctamente");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reservar turno");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [doFetch, filters]);

  const cancelBooking = useCallback(async (id: number, data?: CancelMeetingBooking): Promise<boolean> => {
    try {
      const response = await fetch(`/api/proxy/turnos/bookings/${id}/cancel`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data || {}) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      toast.success("Turno cancelado");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cancelar turno");
      return false;
    }
  }, [doFetch, filters]);

  const addNotes = useCallback(async (id: number, data: MeetingNotes): Promise<boolean> => {
    try {
      const response = await fetch(`/api/proxy/turnos/bookings/${id}/notes`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success("Notas guardadas");
      await doFetch(filters);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar notas");
      return false;
    }
  }, [doFetch, filters]);

  const fetchSchedule = useCallback(async (filtersToUse?: MeetingBookingFilter): Promise<MeetingBookingWithNames[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filtersToUse?.teacher_id) queryParams.append("teacher_id", filtersToUse.teacher_id.toString());

      const url = `/api/proxy/turnos/schedule?${queryParams.toString()}`;
      const response = await fetch(url, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar agenda");
      return [];
    }
  }, []);

  return {
    bookings, isLoading, error,
    fetchBookings, createBooking, cancelBooking, addNotes, fetchSchedule,
  };
}
