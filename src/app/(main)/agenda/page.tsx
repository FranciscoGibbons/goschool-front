"use client";

import { useState } from "react";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useAgendaEvents, AgendaFilters } from "@/hooks/useAgendaEvents";
import { ProtectedPage } from "@/components/ProtectedPage";
import InlineCourseSelector from "@/components/InlineCourseSelector";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import FullCalendarAgenda, {
  CalendarEvent,
} from "@/components/FullCalendarAgenda";
import AgendaEventDetail from "./components/AgendaEventDetail";
import AgendaLegend from "./components/AgendaLegend";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { EVENT_TYPES, EventType } from "@/types/events";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
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
} from "@/components/sacred";
import { Plus } from "lucide-react";

function AgendaContent() {
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

  const [filters, setFilters] = useState<AgendaFilters>({
    showAssessments: true,
    showMeetings: true,
    showClasses: false,
    showEvents: true,
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [createEventLoading, setCreateEventLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [eventCourseId, setEventCourseId] = useState<number | null>(null);

  // Determine courseId based on role
  const effectiveCourseId = (() => {
    if (role === "student") return userInfo?.course_id ?? null;
    if (role === "father") return selectedChild?.course_id ?? null;
    return selectedCourseId;
  })();

  const isStudentOrFather = role === "student" || role === "father";
  const showMeetingsOption = role !== "student";

  const { events, isLoading: eventsLoading, error: eventsError } =
    useAgendaEvents({
      role,
      courseId: effectiveCourseId,
      academicYearId: selectedYearId,
      filters,
      showTimetables: filters.showClasses,
      refreshTrigger: refreshKey,
    });

  const canCreateEvents = role === "admin" || role === "teacher" || role === "preceptor";

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

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
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Error creating event:", err);
    } finally {
      setCreateEventLoading(false);
    }
  };

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
        <PageHeader title="Agenda" />
        <ErrorDisplay
          error={coursesError}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Father with no child selected
  if (role === "father" && !selectedChild) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agenda"
          subtitle="Calendario de actividades"
        />
        <div className="sacred-card text-center py-8">
          <p className="text-sm font-medium text-text-primary">
            Selecciona un hijo
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Usa el selector de hijos para ver su agenda
          </p>
        </div>
      </div>
    );
  }

  const createEventModal = (
    <Modal open={showCreateEvent} onOpenChange={setShowCreateEvent}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Nuevo evento</ModalTitle>
          <ModalDescription>Crear un evento escolar</ModalDescription>
        </ModalHeader>
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <FormGroup>
            <Label htmlFor="event-title">Titulo *</Label>
            <Input id="event-title" name="title" required placeholder="Nombre del evento" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="event-description">Descripcion</Label>
            <Textarea id="event-description" name="description" rows={3} placeholder="Descripcion del evento (opcional)" />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label htmlFor="event-type">Tipo de evento *</Label>
              <NativeSelect id="event-type" name="event_type" required>
                {(Object.entries(EVENT_TYPES) as [EventType, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </NativeSelect>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="start-date">Fecha inicio *</Label>
              <Input id="start-date" name="start_date" type="date" required />
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
          </div>

          <FormGroup>
            <Label htmlFor="event-location">Ubicacion</Label>
            <Input id="event-location" name="location" placeholder="Lugar del evento (opcional)" />
          </FormGroup>

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
            <Button type="button" variant="secondary" onClick={() => { setShowCreateEvent(false); setEventCourseId(null); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createEventLoading}>
              {createEventLoading ? "Creando..." : "Crear evento"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );

  // Student/Father view
  if (isStudentOrFather) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agenda"
          subtitle="Calendario de actividades"
          action={
            academicYears.length > 1 ? (
              <AcademicYearSelector
                academicYears={academicYears}
                selectedYearId={selectedYearId}
                onYearChange={setSelectedYearId}
              />
            ) : null
          }
        />

        <AgendaLegend
          filters={filters}
          onFiltersChange={setFilters}
          showMeetingsOption={showMeetingsOption}
          showClassesOption={!!effectiveCourseId}
        />

        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : eventsError ? (
          <ErrorDisplay
            error={eventsError}
            retry={() => window.location.reload()}
          />
        ) : (
          <FullCalendarAgenda
            events={events}
            onEventClick={handleEventClick}
          />
        )}

        <AgendaEventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    );
  }

  // Staff view (teacher, preceptor, admin)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        subtitle="Calendario de actividades"
        action={
          canCreateEvents ? (
            <Button variant="primary" size="sm" onClick={() => setShowCreateEvent(true)}>
              <Plus className="size-4" />
              Nuevo evento
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3 p-3 sacred-card">
        <InlineCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
        />
        {academicYears.length > 1 && (
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
          />
        )}
      </div>

      <AgendaLegend
        filters={filters}
        onFiltersChange={setFilters}
        showMeetingsOption={showMeetingsOption}
        showClassesOption={!!effectiveCourseId}
      />

      {selectedCourseId ? (
        eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : eventsError ? (
          <ErrorDisplay
            error={eventsError}
            retry={() => window.location.reload()}
          />
        ) : (
          <FullCalendarAgenda
            events={events}
            onEventClick={handleEventClick}
          />
        )
      ) : (
        <div className="sacred-card text-center py-8">
          <p className="text-sm font-medium text-text-primary">
            Selecciona un curso
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para ver la agenda
          </p>
        </div>
      )}

      <AgendaEventDetail
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {canCreateEvents && createEventModal}
    </div>
  );
}

export default function AgendaPage() {
  return (
    <ProtectedPage>
      <ErrorBoundary>
        <AgendaContent />
      </ErrorBoundary>
    </ProtectedPage>
  );
}
