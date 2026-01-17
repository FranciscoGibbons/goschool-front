"use client";

/**
 * Assistance Calendar Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * Uses semantic color tokens from the design system.
 * ==========================================================================
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/sacred";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { Assistance } from "../../../../types/assistance";
import { getDateKey } from "@/utils/dateHelpers";

interface AssistanceCalendarProps {
  assistances: Assistance[];
  studentName?: string;
}

interface CalendarDay {
  date: Date;
  assistance?: Assistance;
  isCurrentMonth: boolean;
}

// Semantic color mapping using design tokens
const presenceConfig = {
  present: {
    bg: "bg-success",
    label: "P",
    legendBg: "bg-success",
    legendText: "Presente (P)",
  },
  absent: {
    bg: "bg-error",
    label: "A",
    legendBg: "bg-error",
    legendText: "Ausente (A)",
  },
  late: {
    bg: "bg-warning",
    label: "T",
    legendBg: "bg-warning",
    legendText: "Tardanza (T)",
  },
  justified: {
    bg: "bg-primary",
    label: "J",
    legendBg: "bg-primary",
    legendText: "Justificado (J)",
  },
} as const;

export default function AssistanceCalendar({
  assistances,
  studentName
}: AssistanceCalendarProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const calendarData = useMemo(() => {
    // Crear un mapa de asistencias por fecha
    const assistanceMap = new Map<string, Assistance>();
    assistances.forEach(assistance => {
      const dateKey = getDateKey(assistance.date);
      assistanceMap.set(dateKey, assistance);
    });

    // Generar días del calendario
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay());

    const days: CalendarDay[] = [];
    const currentCalendarDate = new Date(firstDayOfCalendar);

    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      const dateKey = currentCalendarDate.toISOString().split('T')[0];
      const assistance = assistanceMap.get(dateKey);

      days.push({
        date: new Date(currentCalendarDate),
        assistance,
        isCurrentMonth: currentCalendarDate.getMonth() === currentMonth,
      });

      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }

    return days;
  }, [assistances, currentMonth, currentYear]);

  const getPresenceStyle = (status: string) => {
    return presenceConfig[status as keyof typeof presenceConfig] || {
      bg: "bg-surface-muted",
      label: ""
    };
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon className="size-5 text-primary" />
          Calendario de Asistencia - {monthNames[currentMonth]} {currentYear}
        </CardTitle>
        {studentName && (
          <p className="text-sm text-text-secondary">
            Estudiante: {studentName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-text-secondary p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`
                relative aspect-square p-1 text-sm border rounded-md transition-colors
                ${day.isCurrentMonth
                  ? 'bg-surface border-border'
                  : 'bg-surface-muted/50 border-border-muted text-text-muted'
                }
                ${day.date.toDateString() === currentDate.toDateString()
                  ? 'ring-2 ring-primary'
                  : ''
                }
              `}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-xs font-medium">
                  {day.date.getDate()}
                </span>
                {day.assistance && (
                  <div className="mt-1">
                    <span
                      className={`
                        ${getPresenceStyle(day.assistance.presence).bg}
                        text-text-inverse text-xs px-1 py-0 min-w-[16px] h-4
                        flex items-center justify-center rounded-sm font-medium
                      `}
                    >
                      {getPresenceStyle(day.assistance.presence).label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          {Object.entries(presenceConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={`w-3 h-3 ${config.legendBg} rounded`} />
              <span className="text-text-secondary">{config.legendText}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
