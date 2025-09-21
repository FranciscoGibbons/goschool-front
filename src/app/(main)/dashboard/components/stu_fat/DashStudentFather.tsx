"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BookOpen,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Exam, translateExamType, getExamTypeColor } from "@/utils/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function DashStudentFather() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`/api/proxy/assessments/`, {
          withCredentials: true,
        });
        setExams(res.data);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleViewExams = () => {
    router.push("/examenes");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExamTypeLabel = (type: string) => {
    return translateExamType(type);
  };

  const getExamTypeColorLocal = (type: string) => {
    return getExamTypeColor(type);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Buenos días";
    if (hours < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const isExamSoon = (dateString: string) => {
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const upcomingExams = exams.slice(0, 3);
  const hasUpcomingExams = upcomingExams.length > 0;

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <div className="space-y-4">
        <div>
          <h1 className="heading-1">{getGreeting()}</h1>
          <p className="body-text text-muted-foreground">
            Aquí tienes un resumen de tu actividad académica
          </p>
        </div>
      </div>

      {/* Card principal de exámenes */}
      <Card className="academic-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="heading-3">Próximos Exámenes</CardTitle>
                <p className="body-small text-muted-foreground">
                  Mantente al día con tus evaluaciones
                </p>
              </div>
            </div>
            <Button
              onClick={handleViewExams}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasUpcomingExams ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              </div>
              <h3 className="heading-4 mb-2">No hay exámenes próximos</h3>
              <p className="body-text text-muted-foreground">
                ¡Perfecto! No tienes evaluaciones pendientes por ahora
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md hover:border-accent-foreground/20",
                    isExamSoon(exam.due_date) && "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                  )}
                  onClick={() => router.push("/examenes")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground truncate">
                          {exam.task}
                        </h4>
                        {isExamSoon(exam.due_date) && (
                          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(exam.due_date)}</span>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getExamTypeColorLocal(exam.type))}
                        >
                          {getExamTypeLabel(exam.type)}
                        </Badge>
                        
                        {isExamSoon(exam.due_date) && (
                          <Badge variant="warning" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Próximo
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}

              {exams.length > 3 && (
                <div className="text-center pt-3 border-t">
                  <p className="body-small text-muted-foreground">
                    Y {exams.length - 3} exámenes más...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleViewExams}
              variant="outline"
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Ver todos los exámenes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards adicionales para futuras funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="academic-card opacity-60">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="p-3 bg-muted rounded-lg inline-block">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="heading-4 mb-2">Horarios</h3>
            <p className="body-small text-muted-foreground">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>

        <Card className="academic-card opacity-60">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="p-3 bg-muted rounded-lg inline-block">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="heading-4 mb-2">Calificaciones</h3>
            <p className="body-small text-muted-foreground">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>

        <Card className="academic-card opacity-60">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="p-3 bg-muted rounded-lg inline-block">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="heading-4 mb-2">Mensajes</h3>
            <p className="body-small text-muted-foreground">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
