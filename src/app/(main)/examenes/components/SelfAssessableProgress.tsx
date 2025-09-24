import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
          <Target className="h-5 w-5 text-blue-500" />
          Progreso del Autoevaluable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progreso principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso general</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedQuestions} completadas</span>
            <span>{totalQuestions} total</span>
          </div>
        </div>

        {/* Progreso actual (durante el quiz) */}
        {currentProgress > 0 && currentProgress !== completedQuestions && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso actual</span>
              <span className="font-medium">{Math.round(currentProgressPercentage)}%</span>
            </div>
            <Progress value={currentProgressPercentage} className="h-2 bg-blue-100" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentProgress} respondidas</span>
              <span>{totalQuestions} total</span>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Completadas</span>
            </div>
            <div className="text-lg font-semibold text-green-600">{completedQuestions}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
            <div className="text-lg font-semibold text-orange-600">{pendingQuestions}</div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        {stats && (
          <div className="space-y-3 pt-3 border-t">
            {/* Intentos */}
            {stats.total_attempts !== undefined && stats.total_attempts > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Intentos realizados</span>
                </div>
                <Badge variant="outline">{stats.total_attempts}</Badge>
              </div>
            )}

            {/* Mejor puntuación */}
            {stats.best_score !== undefined && stats.best_score > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Mejor puntuación</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    stats.best_score >= 80 ? "text-green-700 border-green-300 bg-green-50" :
                    stats.best_score >= 60 ? "text-yellow-700 border-yellow-300 bg-yellow-50" :
                    "text-red-700 border-red-300 bg-red-50"
                  )}
                >
                  {stats.best_score.toFixed(1)}%
                </Badge>
              </div>
            )}

            {/* Puntuación promedio */}
            {stats.average_score !== undefined && stats.average_score > 0 && stats.total_attempts && stats.total_attempts > 1 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Puntuación promedio</span>
                </div>
                <Badge variant="outline">{stats.average_score.toFixed(1)}%</Badge>
              </div>
            )}
          </div>
        )}

        {/* Estado de alerta si hay pocas respuestas */}
        {totalQuestions > 0 && completedQuestions > 0 && progressPercentage < 50 && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-200">
            <AlertTriangle className="h-4 w-4" />
            <span>Completa más preguntas para obtener mejores resultados</span>
          </div>
        )}

        {/* Estado de finalización */}
        {progressPercentage === 100 && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm dark:bg-green-950/20 dark:border-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <span>¡Autoevaluable completado!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}