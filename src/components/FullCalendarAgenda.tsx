"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg, DateSelectArg } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: Record<string, unknown>;
}

interface FullCalendarAgendaProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onCreateEvent?: () => void;
  className?: string;
  editable?: boolean;
  selectable?: boolean;
}

const eventColors: Record<string, string> = {
  exam: "#3b82f6",
  homework: "#f59e0b",
  project: "#10b981",
  oral: "#6b7280",
  remedial: "#ef4444",
  selfassessable: "#8b5cf6",
  class: "#0ea5e9",
  meeting: "#ec4899",
  default: "#64748b",
};

export default function FullCalendarAgenda({
  events,
  onEventClick,
  onDateSelect,
  onCreateEvent,
  className,
  editable = false,
  selectable = true,
}: FullCalendarAgendaProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const [title, setTitle] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      setTitle(api.view.title);
    }
  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event: CalendarEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay,
      extendedProps: clickInfo.event.extendedProps as Record<string, unknown>,
    };
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setTitle(api.view.title);
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setTitle(api.view.title);
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setTitle(api.view.title);
    }
  };

  const handleViewChange = (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
      setCurrentView(view);
      setTitle(api.view.title);
    }
  };

  const formattedEvents: EventInput[] = useMemo(() => {
    return events.map((event) => ({
      ...event,
      backgroundColor: event.color || eventColors[event.extendedProps?.type as string] || eventColors.default,
      borderColor: "transparent",
    }));
  }, [events]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Custom toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs">
            Hoy
          </Button>
          <h2 className="text-sm font-medium ml-2">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => handleViewChange("dayGridMonth")}
              className={cn(
                "px-3 py-1.5 text-xs transition-colors",
                currentView === "dayGridMonth"
                  ? "bg-foreground text-background"
                  : "hover:bg-accent"
              )}
            >
              Mes
            </button>
            <button
              onClick={() => handleViewChange("timeGridWeek")}
              className={cn(
                "px-3 py-1.5 text-xs transition-colors border-l",
                currentView === "timeGridWeek"
                  ? "bg-foreground text-background"
                  : "hover:bg-accent"
              )}
            >
              Semana
            </button>
            <button
              onClick={() => handleViewChange("timeGridDay")}
              className={cn(
                "px-3 py-1.5 text-xs transition-colors border-l",
                currentView === "timeGridDay"
                  ? "bg-foreground text-background"
                  : "hover:bg-accent"
              )}
            >
              Dia
            </button>
          </div>

          {onCreateEvent && (
            <Button size="sm" onClick={onCreateEvent} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="minimal-card p-0 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={false}
          events={formattedEvents}
          eventClick={handleEventClick}
          select={handleDateSelect}
          selectable={selectable}
          editable={editable}
          locale="es"
          firstDay={1}
          height="auto"
          dayMaxEvents={3}
          moreLinkText={(n) => `+${n} mas`}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: false,
          }}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            omitZeroMinute: true,
          }}
          allDayText="Todo el dia"
          noEventsText="Sin eventos"
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Dia",
          }}
          views={{
            dayGridMonth: {
              dayHeaderFormat: { weekday: "short" },
            },
            timeGridWeek: {
              dayHeaderFormat: { weekday: "short", day: "numeric" },
            },
            timeGridDay: {
              dayHeaderFormat: { weekday: "long", day: "numeric", month: "long" },
            },
          }}
        />
      </div>

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>
                  {new Date(selectedEvent.start).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              {selectedEvent.extendedProps?.description && (
                <p className="text-muted-foreground">
                  {selectedEvent.extendedProps.description as string}
                </p>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
