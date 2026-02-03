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
import {
  ErrorBoundary,
  ErrorDisplay,
  LoadingSpinner,
  PageHeader,
} from "@/components/sacred";

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
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

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
    });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
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
