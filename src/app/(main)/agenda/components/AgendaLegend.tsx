"use client";

import { eventColors } from "@/components/FullCalendarAgenda";
import { translateExamType, EXAM_TYPES } from "@/utils/examUtils";
import type { AgendaFilters } from "@/hooks/useAgendaEvents";

interface AgendaLegendProps {
  filters: AgendaFilters;
  onFiltersChange: (filters: AgendaFilters) => void;
  showMeetingsOption: boolean;
  showClassesOption: boolean;
}

const examTypes = Object.values(EXAM_TYPES);

export default function AgendaLegend({
  filters,
  onFiltersChange,
  showMeetingsOption,
  showClassesOption,
}: AgendaLegendProps) {
  const toggleFilter = (key: keyof AgendaFilters) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="sacred-card space-y-3">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        Filtros
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleFilter("showAssessments")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            filters.showAssessments
              ? "border-foreground/20 bg-foreground/5 text-text-primary"
              : "border-border bg-surface-muted text-text-muted"
          }`}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: eventColors.exam }}
          />
          Evaluaciones
        </button>

        {showMeetingsOption && (
          <button
            onClick={() => toggleFilter("showMeetings")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              filters.showMeetings
                ? "border-foreground/20 bg-foreground/5 text-text-primary"
                : "border-border bg-surface-muted text-text-muted"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: eventColors.meeting }}
            />
            Reuniones
          </button>
        )}

        {showClassesOption && (
          <button
            onClick={() => toggleFilter("showClasses")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              filters.showClasses
                ? "border-foreground/20 bg-foreground/5 text-text-primary"
                : "border-border bg-surface-muted text-text-muted"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: eventColors.class }}
            />
            Clases
          </button>
        )}

        <button
          onClick={() => toggleFilter("showEvents")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            filters.showEvents
              ? "border-foreground/20 bg-foreground/5 text-text-primary"
              : "border-border bg-surface-muted text-text-muted"
          }`}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: eventColors.event }}
          />
          Eventos
        </button>
      </div>

      {filters.showAssessments && (
        <>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-text-secondary mb-2">
              Tipos de evaluacion
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {examTypes.map((type) => (
                <div key={type} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: eventColors[type] || eventColors.default }}
                  />
                  <span className="text-xs text-text-secondary">
                    {translateExamType(type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
