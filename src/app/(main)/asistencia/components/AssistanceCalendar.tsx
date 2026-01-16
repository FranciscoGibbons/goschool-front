"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const getPresenceColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      case "justified":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  const getPresenceLabel = (status: string) => {
    switch (status) {
      case "present":
        return "P";
      case "absent":
        return "A";
      case "late":
        return "T";
      case "justified":
        return "J";
      default:
        return "";
    }
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
          <p className="text-sm text-muted-foreground">
            Estudiante: {studentName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
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
                  ? 'bg-background border-border' 
                  : 'bg-muted/50 border-muted text-muted-foreground'
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
                    <Badge 
                      className={`
                        ${getPresenceColor(day.assistance.presence)} 
                        text-white text-xs px-1 py-0 min-w-[16px] h-4 
                        flex items-center justify-center
                      `}
                    >
                      {getPresenceLabel(day.assistance.presence)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Presente (P)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Ausente (A)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Tardanza (T)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Justificado (J)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}