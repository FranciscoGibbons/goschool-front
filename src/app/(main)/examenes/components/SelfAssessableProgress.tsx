import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/sacred";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target,
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelfAssessableStats } from "@/types/selfassessable";

interface SelfAssessableProgressProps {
  stats: SelfAssessableStats | null;
  totalQuestions: number;
  currentProgress?: number;
  className?: string;
}

export default function SelfAssessableProgress({
  stats,
  totalQuestions,
  currentProgress = 0,
  className,
}: SelfAssessableProgressProps) {
  if (!stats && totalQuestions === 0) {
    return null;
  }

  const completedQuestions = stats?.completed || 0;
  const pendingQuestions = stats?.pending || Math.max(0, totalQuestions - completedQuestions);
  const progressPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
  const currentProgressPercentage = totalQuestions > 0 ? (currentProgress / totalQuestions) * 100 : 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Progreso del Autoevaluable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progreso principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Progreso general</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{completedQuestions} completadas</span>
            <span>{totalQuestions} total</span>
          </div>
        </div>

        {/* Progreso actual (durante el quiz) */}
        {currentProgress > 0 && currentProgress !== completedQuestions && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Progreso actual</span>
              <span className="font-medium">{Math.round(currentProgressPercentage)}%</span>
            </div>
            <Progress value={currentProgressPercentage} className="h-2 bg-primary/20" />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>{currentProgress} respondidas</span>
              <span>{totalQuestions} total</span>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-xs text-text-secondary">Completadas</span>
            </div>
            <div className="text-lg font-semibold text-success">{completedQuestions}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-text-secondary">Pendientes</span>
            </div>
            <div className="text-lg font-semibold text-warning">{pendingQuestions}</div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        {stats && (
          <div className="space-y-3 pt-3 border-t">
            {/* Intentos */}
            {stats.total_attempts !== undefined && stats.total_attempts > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-text-secondary">Intentos realizados</span>
                </div>
                <Badge variant="neutral">{stats.total_attempts}</Badge>
              </div>
            )}

            {/* Mejor puntuación */}
            {stats.best_score !== undefined && stats.best_score > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-warning" />
                  <span className="text-text-secondary">Mejor puntuación</span>
                </div>
                <Badge
                  variant={
                    stats.best_score >= 80 ? "success" :
                    stats.best_score >= 60 ? "warning" :
                    "error"
                  }
                >
                  {stats.best_score.toFixed(1)}%
                </Badge>
              </div>
            )}

            {/* Puntuación promedio */}
            {stats.average_score !== undefined && stats.average_score > 0 && stats.total_attempts && stats.total_attempts > 1 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-text-secondary">Puntuación promedio</span>
                </div>
                <Badge variant="neutral">{stats.average_score.toFixed(1)}%</Badge>
              </div>
            )}
          </div>
        )}

        {/* Estado de alerta si hay pocas respuestas */}
        {totalQuestions > 0 && completedQuestions > 0 && progressPercentage < 50 && (
          <div className="flex items-center gap-2 p-2 bg-warning-muted border border-border rounded-lg text-warning text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Completa más preguntas para obtener mejores resultados</span>
          </div>
        )}

        {/* Estado de finalización */}
        {progressPercentage === 100 && (
          <div className="flex items-center gap-2 p-2 bg-success-muted border border-border rounded-lg text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Autoevaluable completado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}