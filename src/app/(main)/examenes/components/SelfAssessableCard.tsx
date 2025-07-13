import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  AcademicCapIcon,
  CalendarIcon,
  BookOpenIcon,
  PlayIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import AnswerSelfAssessable from "./AnswerSelfAssessable";

interface SelfAssessableCardProps {
  exam: any; // SelfAssessableExam
  subjectName: string;
  role: string; // nuevo: recibe el rol
}

export default function SelfAssessableCard({
  exam,
  subjectName,
  role,
}: SelfAssessableCardProps) {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  // Estructura de preguntas con opciones (sin mezclar)
  const [mcQuestions, setMcQuestions] = useState<any[]>([]);

  useEffect(() => {
    console.log("Procesando preguntas:", questions);
    if (questions.length > 0 && typeof questions[0] === "object") {
      // Si las preguntas ya tienen opciones (correct, incorrect1, ...)
      const prepared = questions.map((q: any) => {
        console.log("Procesando pregunta:", q);
        const options = [q.op1, q.op2, q.op3].filter(Boolean);
        console.log("Opciones encontradas:", options);
        
        // NO MEZCLAR - mantener orden original
        const preparedQuestion = {
          ...q,
          options: options, // Sin shuffle
        };
        console.log("Pregunta preparada:", preparedQuestion);
        return preparedQuestion;
      });
      console.log("Preguntas preparadas:", prepared);
      setMcQuestions(prepared);
      setAnswers(Array(prepared.length).fill(""));
    } else {
      console.log("No se encontraron preguntas con opciones múltiples");
      setMcQuestions([]);
    }
  }, [questions]);

  // Función para verificar si ya fue respondido usando exam.id directamente
  const checkIfAnswered = async () => {
    if (!exam.id) {
      console.log("No exam.id available, setting answered to false");
      setAnswered(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Checking if answered for exam.id:", exam.id);
      const res = await axios.post(
        "http://localhost:8080/api/v1/get_if_selfassessable_answered/",
        { selfassessable_id: exam.id }, // Usar exam.id directamente
        { withCredentials: true }
      );
      
      console.log("API Response raw:", res.data);
      console.log("Response type:", typeof res.data);
      console.log("Response status:", res.status);
      console.log("Response stringified:", JSON.stringify(res.data));
      
      // Try different ways to parse the response
      let isAnswered = false;
      
      if (typeof res.data === 'boolean') {
        isAnswered = res.data;
      } else if (typeof res.data === 'string') {
        isAnswered = res.data.toLowerCase() === 'true';
      } else if (typeof res.data === 'number') {
        isAnswered = res.data === 1;
      } else if (res.data && typeof res.data === 'object') {
        // If it's an object, check common property names
        isAnswered = res.data.answered || res.data.is_answered || res.data.completed || false;
      }
      
      console.log("Final isAnswered value:", isAnswered);
      setAnswered(isAnswered);
      
    } catch (error) {
      console.error("Error checking if answered:", error);
      console.log("Setting answered to false due to error");
      setAnswered(false);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si ya fue respondido al cargar
  useEffect(() => {
    checkIfAnswered();
  }, [exam.id]);

  const handleChange = (idx: number, value: string) => {
    console.log(`handleChange: pregunta ${idx}, valor: ${value}`);
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[idx] = value;
      console.log("Nuevas respuestas:", newAnswers);
      return newAnswers;
    });
  };

  // Versión optimizada del handleSubmit con refresco automático
  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    
    // Validación: todas las preguntas deben estar respondidas
    const cleanAnswers = answers.map((a) => a.split("__")[0]);
    if (
      cleanAnswers.length !== questions.length ||
      cleanAnswers.some((a) => !a)
    ) {
      setResult("Debes responder todas las preguntas.");
      setSubmitting(false);
      return;
    }
    
    try {
      console.log("Submitting answers:", cleanAnswers);
      // 1. Enviar respuestas al servidor usando exam.id
      const res = await axios.post(
        "http://localhost:8080/api/v1/selfassessables/",
        {
          assessment_id: exam.id, // Usar exam.id directamente
          answers: cleanAnswers,
        },
        { withCredentials: true }
      );
      
      console.log("Submit response:", res.status, res.data);
      
      if (res.status === 200 || res.status === 201) {
        setResult("¡Respuestas enviadas correctamente!");
        
        // 2. OPTIMIZACIÓN: Refrescar estado desde el servidor
        // Esto garantiza que el estado sea consistente con la base de datos
        await checkIfAnswered();
        
        // 3. Cerrar modal después de un breve delay para mostrar el mensaje
        setTimeout(() => {
          setShowQuestions(false);
          setResult(null); // Limpiar mensaje
        }, 1500);
        
      } else {
        setResult("Error al enviar respuestas");
      }
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
      setResult("Error de red o del servidor");
    } finally {
      setSubmitting(false);
    }
  };

  // Cargar preguntas usando exam.id directamente
  const handleOpenQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    
    try {
      if (!exam.id) throw new Error("No hay exam.id disponible");
      
      const res = await axios.get(
        `http://localhost:8080/api/v1/selfassessables/?assessment_id=${exam.id}`,
        { withCredentials: true }
      );
      
      const questionsArr = Array.isArray(res.data) ? res.data : [];
      if (questionsArr.length > 0) {
        setQuestions(questionsArr);
      } else {
        setQuestions([]);
        setQuestionsError("No hay preguntas para este autoevaluable.");
      }
      setShowQuestions(true);
    } catch (error) {
      setQuestionsError("Error al cargar preguntas");
      console.error("Error al hacer fetch de preguntas:", error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Función para refrescar manualmente el estado (opcional)
  const refreshAnsweredStatus = async () => {
    console.log("Manually refreshing answered status");
    await checkIfAnswered();
  };

  // Formato de fecha y hora
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // DEBUG: Add this temporary button to manually refresh status
  const DebugRefreshButton = () => (
    <Button
      onClick={refreshAnsweredStatus}
      variant="outline"
      size="sm"
      className="ml-2 text-xs"
    >
      🔄 Debug Refresh
    </Button>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 exam-card-hover">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 exam-skeleton rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 exam-skeleton rounded w-3/4"></div>
              <div className="h-3 exam-skeleton rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-3 exam-skeleton rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 hover:border-gray-300/50 dark:hover:border-gray-700/50 transition-all duration-200 hover:shadow-sm exam-card-hover">
      {/* Status indicator */}
      <div className="absolute top-6 right-6">
        <div className="flex items-center gap-2">
          <div className="exam-status-indicator"></div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Autoevaluable
          </span>
        </div>
      </div>

      {/* DEBUG INFO - Remove this in production */}
      <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
        <p>Debug: answered = {String(answered)}</p>
        <p>Debug: exam.id = {exam.id}</p>
        <DebugRefreshButton />
      </div>

      {/* Main content */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 exam-green-gradient rounded-xl border border-green-200/20 dark:border-green-800/20">
            <SparklesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {exam.task}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <BookOpenIcon className="w-4 h-4" />
                <span>{subjectName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>Entrega: {formatDate(exam.due_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status section */}
        <div className="flex items-center justify-between">
          {answered === true ? (
            <div className="flex items-center gap-3 p-4 bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Completado
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Ya has respondido este autoevaluable
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Pendiente
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Aún no has respondido
                </p>
              </div>
            </div>
          )}
          
          {answered !== true && (
            <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleOpenQuestions}
                  disabled={questionsLoading}
                  className="exam-btn-vercel px-6 py-2 rounded-lg hover:scale-105"
                >
                  {questionsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Comenzar
                    </>
                  )}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 exam-scrollbar">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Autoevaluación: {exam.task}
                </DialogTitle>
                
                {questionsError && (
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-lg mb-4">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      {questionsError}
                    </p>
                  </div>
                )}
                
                {mcQuestions.length > 0 && (
                  <div className="space-y-6">
                    {mcQuestions.map((question, idx) => (
                      <div key={idx} className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                          Pregunta {idx + 1}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {question.question}
                        </p>
                        <RadioGroup
                          value={answers[idx]}
                          onValueChange={(value) => handleChange(idx, value)}
                          className="space-y-3"
                        >
                          {question.options.map(
                            (option: string, optIdx: number) => (
                              <div
                                key={optIdx}
                                className="flex items-center space-x-3 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  id={`q${idx}-opt${optIdx}`}
                                  name={`question-${idx}`}
                                  value={option}
                                  checked={answers[idx] === option}
                                  onChange={(e) =>
                                    handleChange(idx, e.target.value)
                                  }
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 focus:ring-2"
                                />
                                <label
                                  htmlFor={`q${idx}-opt${optIdx}`}
                                  className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer flex-1"
                                >
                                  {option}
                                </label>
                              </div>
                            )
                          )}
                        </RadioGroup>
                      </div>
                    ))}
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || answers.some((a) => !a)}
                        className="exam-btn-vercel transition-all duration-200"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Enviar respuestas
                          </>
                        )}
                      </Button>
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          className="border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                        >
                          Cancelar
                        </Button>
                      </DialogClose>
                    </div>
                    
                    {result && (
                      <div
                        className={`p-4 rounded-lg text-sm border ${
                          result.includes("correctamente")
                            ? "bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50"
                            : "bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-800/50"
                        }`}
                      >
                        {result}
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
    </div>
  );
}
