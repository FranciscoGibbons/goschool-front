import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { 
  SelfAssessableQuestion,
  SelfAssessableResponse,
  SelfAssessableSubmission,
  SelfAssessableResult,
  SelfAssessableStats
} from "@/types/selfassessable";

interface UseSelfAssessableOptions {
  assessmentId?: number;
  autoLoad?: boolean;
}

export function useSelfAssessable(options: UseSelfAssessableOptions = {}) {
  const { assessmentId, autoLoad = true } = options;
  
  const [questions, setQuestions] = useState<SelfAssessableQuestion[]>([]);
  const [responses, setResponses] = useState<SelfAssessableResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<SelfAssessableResult | null>(null);
  const [stats, setStats] = useState<SelfAssessableStats | null>(null);

  // Función para verificar si el autoevaluable ya fue respondido
  const checkIfAnswered = useCallback(async (selfAssessableId: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/proxy/get-if-selfassessable-answered/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selfassessable_id: selfAssessableId }),
      });

      if (!response.ok) {
        throw new Error("Error al verificar estado del autoevaluable");
      }

      const data = await response.json();
      
      // Normalizar la respuesta del backend
      let answered = false;
      if (typeof data === "boolean") {
        answered = data;
      } else if (typeof data === "string") {
        answered = data.toLowerCase() === "true";
      } else if (typeof data === "number") {
        answered = data === 1;
      } else if (data && typeof data === "object") {
        answered = data.answered || data.is_answered || data.completed || false;
      }

      setIsAnswered(answered);
      return answered;
    } catch (err) {
      console.error("Error checking if answered:", err);
      setIsAnswered(false);
      return false;
    }
  }, []);

  // Función para obtener las preguntas del autoevaluable
  const fetchQuestions = useCallback(async (selfAssessableId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/proxy/selfassessables/?assessment_id=${selfAssessableId}`, {
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const questionsArray = Array.isArray(data) ? data : [];
      
      if (questionsArray.length === 0) {
        throw new Error("No hay preguntas disponibles para este autoevaluable");
      }

      setQuestions(questionsArray);
      return questionsArray;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar preguntas";
      setError(errorMessage);
      console.error("Error fetching questions:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para obtener las respuestas del estudiante
  const fetchResponses = useCallback(async (selfAssessableId: number) => {
    try {
      const response = await fetch(`/api/proxy/selfassessables/responses?assessment_id=${selfAssessableId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const responsesArray = Array.isArray(data) ? data : [];
        setResponses(responsesArray);
        return responsesArray;
      }
    } catch (err) {
      console.error("Error fetching responses:", err);
    }
    return [];
  }, []);

  // Función para enviar respuestas
  const submitAnswers = useCallback(async (submission: SelfAssessableSubmission): Promise<SelfAssessableResult | null> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/proxy/selfassessables/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Si el backend devuelve un resultado detallado, lo procesamos
      if (result && typeof result === "object") {
        setLastResult(result);
      }

      // Actualizar estado de respondido
      await checkIfAnswered(submission.assessment_id);
      
      toast.success("Respuestas enviadas correctamente");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar respuestas";
      setError(errorMessage);
      console.error("Error submitting answers:", err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [checkIfAnswered]);

  // Función para calcular estadísticas
  const calculateStats = useCallback((questionsData: SelfAssessableQuestion[], responsesData: SelfAssessableResponse[]) => {
    if (!questionsData.length || !responsesData.length) {
      return null;
    }

    const totalQuestions = questionsData.length;
    const completed = responsesData.length;
    const pending = Math.max(0, totalQuestions - completed);
    
    // Calcular puntajes si están disponibles
    const scores = responsesData
      .filter(r => r.score !== undefined && r.max_score !== undefined)
      .map(r => (r.score! / r.max_score!) * 100);
    
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const statsData: SelfAssessableStats = {
      total_attempts: responsesData.length,
      completed,
      pending,
      average_score: averageScore,
      best_score: bestScore,
    };

    setStats(statsData);
    return statsData;
  }, []);

  // Función para cargar todos los datos
  const loadSelfAssessableData = useCallback(async (selfAssessableId: number) => {
    try {
      setIsLoading(true);
      
      // Cargar en paralelo
      const [questionsData, answered] = await Promise.all([
        fetchQuestions(selfAssessableId),
        checkIfAnswered(selfAssessableId)
      ]);

      // Si ya está respondido, cargar las respuestas
      if (answered) {
        const responsesData = await fetchResponses(selfAssessableId);
        calculateStats(questionsData, responsesData);
      }

      return { questions: questionsData, answered };
    } catch (err) {
      // Error ya manejado en fetchQuestions
      throw err;
    }
  }, [fetchQuestions, checkIfAnswered, fetchResponses, calculateStats]);

  // Cargar datos automáticamente si se proporciona assessmentId
  useEffect(() => {
    if (assessmentId && autoLoad) {
      loadSelfAssessableData(assessmentId).catch(console.error);
    }
  }, [assessmentId, autoLoad, loadSelfAssessableData]);

  // Función para reiniciar el estado
  const reset = useCallback(() => {
    setQuestions([]);
    setResponses([]);
    setIsAnswered(false);
    setLastResult(null);
    setStats(null);
    setError(null);
  }, []);

  return {
    questions,
    responses,
    isLoading,
    isSubmitting,
    error,
    isAnswered,
    lastResult,
    stats,
    checkIfAnswered,
    fetchQuestions,
    fetchResponses,
    submitAnswers,
    loadSelfAssessableData,
    calculateStats,
    reset,
  };
}