"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import InlineCourseSelector from "@/components/InlineCourseSelector";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { SchoolEvent, EVENT_TYPES, EventType } from "@/types/events";
import { fetchAllPages } from "@/utils/fetchAllPages";
import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  EmptyState,
  ErrorBoundary,
  ErrorDisplay,
  FormGroup,
  Input,
  Label,
  LoadingSpinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  NativeSelect,
  PageHeader,
  Textarea,
  ConfirmationModal,
} from "@/components/sacred";
import {
  Plus,
  MapPin,
  Clock,
  User,
  Calendar,
  Trash2,
} from "lucide-react";

const EVENT_TYPE_COLORS: Record<string, string> = {
  artistic: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  sports: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cultural: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  academic: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  institutional: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time.substring(0, 5);
}

function EventosContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const role = userInfo?.role || null;

  const {
    courses,
    selectedCourseId,
    isLoading: coursesLoading,
    error: coursesError,
    setSelectedCourseId,
  } = useCourseStudentSelection(role);

  const { academicYears, selectedYearId, setSelectedYearId } =
    useAcademicYears();

  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [createEventLoading, setCreateEventLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<SchoolEvent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [eventCourseId, setEventCourseId] = useState<number | null>(null);

  const canCreateEvents =
    role === "admin" || role === "teacher" || role === "preceptor";

  const effectiveCourseId = (() => {
    if (role === "student") return userInfo?.course_id ?? null;
    if (role === "father") return selectedChild?.course_id ?? null;
    return selectedCourseId;
  })();

  const isStudentOrFather = role === "student" || role === "father";

  const loadEvents = useCallback(async () => {
    if (!role) return;
    if (!isStudentOrFather && !effectiveCourseId) return;

    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (selectedYearId) params.academic_year_id = selectedYearId;
      if (effectiveCourseId) params.course_id = effectiveCourseId;

      const data = await fetchAllPages<SchoolEvent>(
        "/api/proxy/events/",
        params
      );
      setEvents(data);
    } catch {
      setError("Error al cargar los eventos");
    } finally {
      setIsLoading(false);
    }
  }, [role, effectiveCourseId, selectedYearId, isStudentOrFather]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateEventLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const body: Record<string, unknown> = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      event_type: formData.get("event_type") as string,
      start_date: formData.get("start_date") as string,
      end_date: (formData.get("end_date") as string) || null,
      start_time: (formData.get("start_time") as string) || null,
      end_time: (formData.get("end_time") as string) || null,
      location: (formData.get("location") as string) || null,
    };

    body.course_id = eventCourseId;

    if (selectedYearId) {
      body.academic_year_id = selectedYearId;
    }

    try {
      const res = await fetch("/api/proxy/events/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowCreateEvent(false);
        setEventCourseId(null);
        loadEvents();
      }
    } catch (err) {
      console.error("Error creating event:", err);
    } finally {
      setCreateEventLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEvent) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/proxy/events/${deleteEvent.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteEvent(null);
        setSelectedEvent(null);
        loadEvents();
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredEvents =
    filterType === "all"
      ? events
      : events.filter((e) => e.event_type === filterType);

  // Separate into upcoming and past
  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = filteredEvents
    .filter((e) => e.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  const pastEvents = filteredEvents
    .filter((e) => e.end_date < today)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Eventos" />
        <ErrorDisplay error={coursesError} retry={() => window.location.reload()} />
      </div>
    );
  }

  if (role === "father" && !selectedChild) {
    return (
      <div className="space-y-6">
        <PageHeader title="Eventos" subtitle="Eventos escolares" />
        <div className="sacred-card text-center py-8">
          <p className="text-sm font-medium text-text-primary">
            Selecciona un hijo
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Usa el selector de hijos para ver los eventos
          </p>
        </div>
      </div>
    );
  }

  const renderEventCard = (event: SchoolEvent) => {
    const isMultiDay = event.start_date !== event.end_date;
    const canEdit =
      event.created_by === userInfo?.id || role === "admin";

    return (
      <div
        key={event.id}
        className="sacred-card hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedEvent(event)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className={
                  EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other
                }
              >
                {EVENT_TYPES[event.event_type] || event.event_type}
              </Badge>
              {isMultiDay && (
                <Badge variant="outline" className="text-xs">
                  Multi-dia
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-text-primary truncate">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateRange(event.start_date, event.end_date)}
              </span>
              {event.start_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(event.start_time)}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteEvent(event);
                }}
                className="p-1.5 rounded-md hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Eventos</h1>
            <p className="page-subtitle">Eventos escolares</p>
          </div>
          {canCreateEvents && (
            <Button variant="primary" size="sm" onClick={() => setShowCreateEvent(true)}>
              <Plus className="size-4" />
              Nuevo evento
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 sacred-card">
        {!isStudentOrFather && (
          <InlineCourseSelector
            courses={courses}
            selectedCourseId={selectedCourseId}
            onCourseChange={setSelectedCourseId}
          />
        )}
        {academicYears.length > 1 && (
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
          />
        )}
        <NativeSelect
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-auto"
        >
          <option value="all">Todos los tipos</option>
          {(Object.entries(EVENT_TYPES) as [EventType, string][]).map(
            ([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            )
          )}
        </NativeSelect>
      </div>

      {/* Content */}
      {!isStudentOrFather && !selectedCourseId ? (
        <div className="sacred-card text-center py-8">
          <p className="text-sm font-medium text-text-primary">
            Selecciona un curso
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para ver los eventos
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} retry={loadEvents} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Sin eventos"
          description="No hay eventos programados"
        />
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Proximos eventos ({upcomingEvents.length})
              </h2>
              <div className="grid gap-3">
                {upcomingEvents.map(renderEventCard)}
              </div>
            </div>
          )}

          {/* Past */}
          {pastEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Eventos pasados ({pastEvents.length})
              </h2>
              <div className="grid gap-3 opacity-75">
                {pastEvents.map(renderEventCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle>{selectedEvent?.title}</ModalTitle>
            <ModalDescription>Detalle del evento</ModalDescription>
          </ModalHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    EVENT_TYPE_COLORS[selectedEvent.event_type] ||
                    EVENT_TYPE_COLORS.other
                  }
                >
                  {EVENT_TYPES[selectedEvent.event_type] ||
                    selectedEvent.event_type}
                </Badge>
              </div>
              {selectedEvent.description && (
                <p className="text-sm text-text-secondary">
                  {selectedEvent.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-text-secondary" />
                  <span>
                    {formatDateRange(
                      selectedEvent.start_date,
                      selectedEvent.end_date
                    )}
                  </span>
                </div>
                {selectedEvent.start_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-secondary" />
                    <span>
                      {formatTime(selectedEvent.start_time)}
                      {selectedEvent.end_time &&
                        ` - ${formatTime(selectedEvent.end_time)}`}
                    </span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-text-secondary" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-text-secondary" />
                  <span>Creado por {selectedEvent.creator_name}</span>
                </div>
              </div>
            </div>
          )}
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedEvent(null)}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create modal */}
      <Modal open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle>Nuevo evento</ModalTitle>
            <ModalDescription>Crear un evento escolar</ModalDescription>
          </ModalHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <FormGroup>
              <Label htmlFor="event-title">Titulo *</Label>
              <Input
                id="event-title"
                name="title"
                required
                placeholder="Nombre del evento"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="event-description">Descripcion</Label>
              <Textarea
                id="event-description"
                name="description"
                rows={3}
                placeholder="Descripcion del evento (opcional)"
              />
            </FormGroup>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup>
                <Label htmlFor="event-type">Tipo *</Label>
                <NativeSelect id="event-type" name="event_type" required>
                  {(
                    Object.entries(EVENT_TYPES) as [EventType, string][]
                  ).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="start-date">Fecha inicio *</Label>
                <Input
                  id="start-date"
                  name="start_date"
                  type="date"
                  required
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup>
                <Label htmlFor="end-date">Fecha fin</Label>
                <Input id="end-date" name="end_date" type="date" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="event-start">Hora inicio</Label>
                <Input id="event-start" name="start_time" type="time" />
              </FormGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup>
                <Label htmlFor="event-end">Hora fin</Label>
                <Input id="event-end" name="end_time" type="time" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="event-location">Ubicacion</Label>
                <Input
                  id="event-location"
                  name="location"
                  placeholder="Lugar"
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Curso</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="w-full justify-start text-sm font-normal">
                    {eventCourseId === null
                      ? "Todo el colegio"
                      : courses.find((c) => c.id === eventCourseId)?.name || "Todo el colegio"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 max-h-64 overflow-y-auto p-2">
                  <div className="flex gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setEventCourseId(null)}
                    >
                      Todo el colegio
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        const primary = courses.find((c) => c.level === "primary");
                        if (primary) setEventCourseId(primary.id);
                      }}
                    >
                      Primaria
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        const secondary = courses.find((c) => c.level === "secondary");
                        if (secondary) setEventCourseId(secondary.id);
                      }}
                    >
                      Secundaria
                    </Button>
                  </div>
                  {courses.map((course) => (
                    <DropdownMenuCheckboxItem
                      key={course.id}
                      checked={eventCourseId === course.id}
                      onCheckedChange={(checked) => {
                        setEventCourseId(checked ? course.id : null);
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {course.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FormGroup>

            <ModalFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowCreateEvent(false); setEventCourseId(null); }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createEventLoading}>
                {createEventLoading ? "Creando..." : "Crear evento"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmationModal
        open={!!deleteEvent}
        onOpenChange={() => setDeleteEvent(null)}
        title="Eliminar evento"
        description={`Estas seguro de que deseas eliminar "${deleteEvent?.title}"? Esta accion no se puede deshacer.`}
        onConfirm={handleDeleteEvent}
        danger
        loading={deleteLoading}
      />
    </div>
  );
}

export default function EventosPage() {
  return (
    <ProtectedPage>
      <ErrorBoundary>
        <EventosContent />
      </ErrorBoundary>
    </ProtectedPage>
  );
}
