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

  // Utilidad para mezclar aleatoriamente un array
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Estructura de preguntas con opciones mezcladas
  const [mcQuestions, setMcQuestions] = useState<any[]>([]);

  useEffect(() => {
    console.log("Procesando preguntas:", questions);
    if (questions.length > 0 && typeof questions[0] === "object") {
      // Si las preguntas ya tienen opciones (correct, incorrect1, ...)
      const prepared = questions.map((q: any) => {
        console.log("Procesando pregunta:", q);
        const options = [q.correct, q.incorrect1, q.incorrect2].filter(Boolean);
        console.log("Opciones encontradas:", options);
        console.log(
          "Opciones completas:",
          options.map((opt) => `"${opt}"`)
        );
        console.log("Primera pregunta completa:", q);
        const preparedQuestion = {
          ...q,
          options: shuffle(options),
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

  useEffect(() => {
    const checkAnswered = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          "http://localhost:8080/api/v1/get_if_selfassessable_answered/",
          { selfassessable_id: exam.selfassessable_id }, // <-- CORREGIDO
          { withCredentials: true }
        );
        setAnswered(res.data === true);
      } catch (e) {
        setAnswered(false);
      } finally {
        setLoading(false);
      }
    };
    checkAnswered();
  }, [exam.selfassessable_id]);

  const handleChange = (idx: number, value: string) => {
    console.log(`handleChange: pregunta ${idx}, valor: ${value}`);
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[idx] = value;
      console.log("Nuevas respuestas:", newAnswers);
      return newAnswers;
    });
  };

  // Cambia el handleSubmit para limpiar las respuestas antes de enviarlas
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
      const res = await axios.post(
        "http://localhost:8080/api/v1/selfassessables/",
        {
          assessment_id: exam.id || exam.selfassessable_id,
          answers: cleanAnswers,
        },
        { withCredentials: true }
      );
      if (res.status === 200 || res.status === 201) {
        setResult("¡Respuestas enviadas correctamente!");
        setAnswered(true);
        setShowQuestions(false);
      } else {
        setResult("Error al enviar respuestas");
      }
    } catch (e) {
      setResult("Error de red o del servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      let questionsArr = [];
      if (exam.selfassessable_id) {
        // Fetch solo las preguntas de este autoevaluable
        const res = await axios.get(
          `http://localhost:8080/api/v1/selfassessables/?selfassessable_id=${exam.selfassessable_id}`,
          { withCredentials: true }
        );
        questionsArr = Array.isArray(res.data) ? res.data : [];
      } else {
        // Fallback: fetch todas y filtra por selfassessable_id si está en las preguntas
        const res = await axios.get(
          `http://localhost:8080/api/v1/selfassessables/`,
          { withCredentials: true }
        );
        questionsArr = Array.isArray(res.data)
          ? res.data.filter((q) => q.selfassessable_id === exam.id)
          : [];
      }
      if (questionsArr.length > 0) {
        setQuestions(questionsArr);
      } else {
        setQuestions([]);
        setQuestionsError("No hay preguntas para este autoevaluable.");
      }
      setShowQuestions(true);
    } catch (e) {
      setQuestionsError("Error al cargar preguntas");
      console.error("Error al hacer fetch de preguntas:", e);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Formato de fecha y hora
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d
      .toLocaleDateString("es-ES", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };
  const formatHour = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <AcademicCapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {exam.task}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium">
                  Autoevaluable
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpenIcon className="h-4 w-4" />
                  <span>{subjectName}</span>
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Fecha de entrega: {formatDate(exam.due_date)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {answered ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-green-700 dark:text-green-400 font-medium text-sm">
                  Completado
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs">
                  Ya has respondido este autoevaluable
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-orange-700 dark:text-orange-400 font-medium text-sm">
                  Pendiente
                </p>
                <p className="text-orange-600 dark:text-orange-400 text-xs">
                  Aún no has respondido
                </p>
              </div>
            </div>
          )}

          {!answered && (
            <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleOpenQuestions}
                  disabled={questionsLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                >
                  {questionsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Comenzar autoevaluación
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold">
                  Autoevaluación: {exam.task}
                </DialogTitle>
                {questionsError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      {questionsError}
                    </p>
                  </div>
                )}
                {mcQuestions.length > 0 && (
                  <div className="space-y-6">
                    {mcQuestions.map((question, idx) => (
                      <div key={idx} className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Pregunta {idx + 1}: {question.question}
                        </h4>
                        <RadioGroup
                          value={answers[idx]}
                          onValueChange={(value) => handleChange(idx, value)}
                        >
                          {question.options.map(
                            (option: string, optIdx: number) => (
                              <div
                                key={optIdx}
                                className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
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
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
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
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || answers.some((a) => !a)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
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
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                    </div>
                    {result && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          result.includes("correctamente")
                            ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
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
      </CardContent>
    </Card>
  );
}
