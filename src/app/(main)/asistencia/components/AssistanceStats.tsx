"use client";

/**
 * Assistance Stats Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * Uses semantic color tokens from the design system.
 * ==========================================================================
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/sacred";
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

// Semantic status variants using design tokens
const statusVariants = {
  present: {
    bg: "bg-success-muted",
    text: "text-success",
    badge: "success" as const,
  },
  absent: {
    bg: "bg-error-muted",
    text: "text-error",
    badge: "error" as const,
  },
  late: {
    bg: "bg-warning-muted",
    text: "text-warning",
    badge: "warning" as const,
  },
  justified: {
    bg: "bg-primary/10",
    text: "text-primary",
    badge: "info" as const,
  },
};

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

  const getAttendanceStatus = (percentage: number): { badge: "success" | "info" | "warning" | "error"; label: string } => {
    if (percentage >= 90) return { badge: "success", label: "Excelente" };
    if (percentage >= 80) return { badge: "info", label: "Buena" };
    if (percentage >= 70) return { badge: "warning", label: "Regular" };
    return { badge: "error", label: "Deficiente" };
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
            <p className="text-sm text-text-secondary">
              Estudiante: {studentName}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-center py-4">
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
          <p className="text-sm text-text-secondary">
            Estudiante: {studentName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary">{stats.total}</div>
            <div className="text-sm text-text-secondary">Total de días</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-semibold text-success">
                {stats.presentPercentage}%
              </span>
              <Badge variant={attendanceStatus.badge}>
                {attendanceStatus.label}
              </Badge>
            </div>
            <div className="text-sm text-text-secondary">Asistencia</div>
          </div>
        </div>

        {/* Desglose detallado */}
        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-lg ${statusVariants.present.bg}`}>
            <div className="flex items-center gap-3">
              <CheckCircleIcon className={`size-5 ${statusVariants.present.text}`} />
              <span className="font-medium text-text-primary">Presente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">{stats.present}</span>
              <Badge variant="success">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-lg ${statusVariants.absent.bg}`}>
            <div className="flex items-center gap-3">
              <ExclamationCircleIcon className={`size-5 ${statusVariants.absent.text}`} />
              <span className="font-medium text-text-primary">Ausente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">{stats.absent}</span>
              <Badge variant="error">
                {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-lg ${statusVariants.late.bg}`}>
            <div className="flex items-center gap-3">
              <ClockIcon className={`size-5 ${statusVariants.late.text}`} />
              <span className="font-medium text-text-primary">Tardanza</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">{stats.late}</span>
              <Badge variant="warning">
                {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-lg ${statusVariants.justified.bg}`}>
            <div className="flex items-center gap-3">
              <UserIcon className={`size-5 ${statusVariants.justified.text}`} />
              <span className="font-medium text-text-primary">Justificado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">{stats.justified}</span>
              <Badge variant="info">
                {stats.total > 0 ? Math.round((stats.justified / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-text-primary">Distribución de asistencia</div>
          <div className="w-full bg-surface-muted rounded-lg h-3">
            <div className="flex h-3 rounded-lg overflow-hidden">
              <div
                className="bg-success"
                style={{ width: `${(stats.present / stats.total) * 100}%` }}
              />
              <div
                className="bg-warning"
                style={{ width: `${(stats.late / stats.total) * 100}%` }}
              />
              <div
                className="bg-primary"
                style={{ width: `${(stats.justified / stats.total) * 100}%` }}
              />
              <div
                className="bg-error"
                style={{ width: `${(stats.absent / stats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
