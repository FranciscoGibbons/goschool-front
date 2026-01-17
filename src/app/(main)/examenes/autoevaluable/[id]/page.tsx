"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import userInfoStore from "@/store/userInfoStore";
import EnhancedAnswerSelfAssessable from "../../components/EnhancedAnswerSelfAssessable";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Assessment {
  id: number;
  task: string;
  name: string;
  subject_id: number;
  subject_name: string;
  due_date: string;
  type: string;
}

export default function SelfAssessablePage() {
  const params = useParams();
  const { userInfo } = userInfoStore();
  const { isLoading: authLoading } = useAuthRedirect();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assessmentId = params?.id ? parseInt(params.id as string) : null;

  // Función para obtener los datos del assessment
  const fetchAssessment = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/proxy/assessments/?id=${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        if (response.status === 404) {
          throw new Error("El autoevaluable no fue encontrado.");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // El backend puede devolver un array o un objeto
      let assessmentData;
      if (Array.isArray(data)) {
        assessmentData = data.find((a: Assessment) => a.id === id);
      } else {
        assessmentData = data;
      }

      if (!assessmentData) {
        throw new Error("Autoevaluable no encontrado");
      }

      // Verificar que sea un autoevaluable
      if (assessmentData.type !== "selfassessable") {
        throw new Error("El examen seleccionado no es un autoevaluable");
      }

      setAssessment(assessmentData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el autoevaluable";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching assessment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando cambie el ID
  useEffect(() => {
    if (assessmentId && userInfo) {
      fetchAssessment(assessmentId);
    }
  }, [assessmentId, userInfo]);

  // Loading state inicial
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Cargando autoevaluable...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-error-muted border border-border rounded-lg p-6 text-error">
            <h2 className="text-xl font-semibold mb-2">Error al cargar</h2>
            <p>{error}</p>
            <button
              onClick={() => assessmentId && fetchAssessment(assessmentId)}
              className="mt-4 px-4 py-2 bg-error-muted hover:bg-error/10 rounded-lg text-error transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No assessment found
  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Autoevaluable no encontrado</h2>
          <p className="text-text-secondary mb-6">
            El autoevaluable que buscas no existe o no tienes permisos para verlo.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Formatear fecha de vencimiento
  const formatDueDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <EnhancedAnswerSelfAssessable
      assessmentId={assessment.id}
      assessmentName={assessment.name || assessment.task}
      subjectName={assessment.subject_name}
      dueDate={assessment.due_date ? formatDueDate(assessment.due_date) : undefined}
    />
  );
}