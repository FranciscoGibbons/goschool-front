"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import type { Assistance } from "../../../../types/assistance";

interface AssistanceStatsProps {
  assistances: Assistance[];
  studentName?: string;
}

export default function AssistanceStats({ 
  assistances, 
  studentName 
}: AssistanceStatsProps) {
  const stats = useMemo(() => {
    const total = assistances.length;
    if (total === 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        justified: 0,
        presentPercentage: 0,
        absentPercentage: 0,
      };
    }

    const present = assistances.filter(a => a.presence === "present").length;
    const absent = assistances.filter(a => a.presence === "absent").length;
    const late = assistances.filter(a => a.presence === "late").length;
    const justified = assistances.filter(a => a.presence === "justified").length;

    return {
      total,
      present,
      absent,
      late,
      justified,
      presentPercentage: Math.round((present / total) * 100),
      absentPercentage: Math.round((absent / total) * 100),
    };
  }, [assistances]);

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { color: "bg-green-100 text-green-800", label: "Excelente" };
    if (percentage >= 80) return { color: "bg-blue-100 text-blue-800", label: "Buena" };
    if (percentage >= 70) return { color: "bg-yellow-100 text-yellow-800", label: "Regular" };
    return { color: "bg-red-100 text-red-800", label: "Deficiente" };
  };

  const attendanceStatus = getAttendanceStatus(stats.presentPercentage);

  if (stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDaysIcon className="size-5 text-primary" />
            Estadísticas de Asistencia
          </CardTitle>
          {studentName && (
            <p className="text-sm text-muted-foreground">
              Estudiante: {studentName}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No hay registros de asistencia para mostrar estadísticas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon className="size-5 text-primary" />
          Estadísticas de Asistencia
        </CardTitle>
        {studentName && (
          <p className="text-sm text-muted-foreground">
            Estudiante: {studentName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total de días</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats.presentPercentage}%
              </span>
              <Badge className={attendanceStatus.color}>
                {attendanceStatus.label}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Asistencia</div>
          </div>
        </div>

        {/* Desglose detallado */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="size-5 text-green-600" />
              <span className="font-medium">Presente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{stats.present}</span>
              <Badge className="bg-green-100 text-green-800">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <ExclamationCircleIcon className="size-5 text-red-600" />
              <span className="font-medium">Ausente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{stats.absent}</span>
              <Badge className="bg-red-100 text-red-800">
                {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-3">
              <ClockIcon className="size-5 text-yellow-600" />
              <span className="font-medium">Tardanza</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{stats.late}</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <UserIcon className="size-5 text-blue-600" />
              <span className="font-medium">Justificado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{stats.justified}</span>
              <Badge className="bg-blue-100 text-blue-800">
                {stats.total > 0 ? Math.round((stats.justified / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Distribución de asistencia</div>
          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${(stats.present / stats.total) * 100}%` }}
              ></div>
              <div
                className="bg-yellow-500"
                style={{ width: `${(stats.late / stats.total) * 100}%` }}
              ></div>
              <div
                className="bg-blue-500"
                style={{ width: `${(stats.justified / stats.total) * 100}%` }}
              ></div>
              <div
                className="bg-red-500"
                style={{ width: `${(stats.absent / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}