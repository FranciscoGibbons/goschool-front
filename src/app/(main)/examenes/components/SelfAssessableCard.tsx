import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import {
  CalendarIcon,
  BookOpenIcon,
  PlayIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { SelfAssessableExam } from "@/utils/types";

interface Question {
  id: number;
  question: string;
  op1: string;
  op2: string;
  op3: string;
  correct: string;
}

interface MCQQuestion extends Question {
  options: string[];
}

interface SelfAssessableCardProps {
  exam: SelfAssessableExam;
  subjectName: string;
  role: string;
}

export default function SelfAssessableCard({
  exam,
  subjectName,
  role,
}: SelfAssessableCardProps) {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mcQuestions, setMcQuestions] = useState<MCQQuestion[]>([]);

  // Verificar si es estudiante
  const isStudent = role === "student";

  // Fecha de hoy y due
  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [year, month, day] = exam.due_date.split("-").map(Number);
  const dueOnly = new Date(year, month - 1, day); // sin hora, sin desfase
  const isBefore = todayOnly < dueOnly;
  const isToday = todayOnly.getTime() === dueOnly.getTime();
  const isAfter = todayOnly > dueOnly;

  // Formatea fecha
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const monthNames = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    const monthName = monthNames[month - 1];
    return `${day.toString().padStart(2, "0")} ${monthName}. ${year}`;
  };

  // Verifica si ya respondido (solo para estudiantes)
  const checkIfAnswered = useCallback(async () => {
    if (!exam.id || !isStudent) return setAnswered(false);
    setLoading(true);
    try {
      const isAnsweredData = await axios.post(
        `/api/proxy/get-if-selfassessable-answered/`,
        { selfassessable_id: exam.id },
        { withCredentials: true }
      );
      const isAnsweredResult = isAnsweredData.data;
      let isAnswered = false;
      if (typeof isAnsweredResult === "boolean") isAnswered = isAnsweredResult;
      else if (typeof isAnsweredResult === "string")
        isAnswered = isAnsweredResult.toLowerCase() === "true";
      else if (typeof isAnsweredResult === "number") isAnswered = isAnsweredResult === 1;
      else if (isAnsweredResult && typeof isAnsweredResult === "object")
        isAnswered =
          isAnsweredResult.answered ||
          isAnsweredResult.is_answered ||
          isAnsweredResult.completed ||
          false;
      setAnswered(isAnswered);
    } catch {
      setAnswered(false);
    } finally {
      setLoading(false);
    }
  }, [exam.id, isStudent]);

  useEffect(() => {
    checkIfAnswered();
  }, [exam.id, isStudent, checkIfAnswered]);

  // Prepara preguntas MC
  useEffect(() => {
    if (questions.length && typeof questions[0] === "object") {
      const prepared = questions.map((q: Question) => ({
        ...q,
        options: [q.op1, q.op2, q.op3].filter(Boolean),
      }));
      setMcQuestions(prepared);
      setAnswers(Array(prepared.length).fill(""));
    }
  }, [questions]);

  // Carga preguntas al abrir
  const handleOpenQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const questionsData = await axios.get(
        `/api/proxy/selfassessables/?assessment_id=${exam.id}`, {
          withCredentials: true,
        }
      );
      const questionsResult = questionsData.data;
      const arr = Array.isArray(questionsResult) ? questionsResult : [];
      if (arr.length) setQuestions(arr);
      else throw new Error("Sin preguntas");
    } catch {
      setQuestionsError("No hay preguntas para este autoevaluable.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Cambio de respuestas
  const handleChange = (idx: number, value: string) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  // Envía respuestas
  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    const clean = answers.map((a) => a.split("__")[0]);
    if (clean.length !== mcQuestions.length || clean.some((x) => !x)) {
      setResult("Debes responder todas las preguntas.");
      setSubmitting(false);
      return;
    }
    try {
      const res = await axios.post(
        `/api/proxy/selfassessables/`,
        { assessment_id: exam.id, answers: clean },
        { withCredentials: true }
      );
      if (res) {
        setResult("¡Respuestas enviadas correctamente!");
        await checkIfAnswered();
        setTimeout(() => setShowQuestions(false), 1200);
      } else setResult("Error al enviar respuestas");
    } catch {
      setResult("Error de red o del servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-6 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="relative rounded-xl border border-border bg-card shadow-sm px-6 py-5 space-y-4 exam-fade-in hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{exam.task}</h3>
          <p className="text-sm text-muted-foreground">
            Autoevaluación de {subjectName}
          </p>
        </div>
        {/* Estado - Solo para estudiantes */}
        {isStudent && (
          <div className="text-sm">
            {!answered && isBefore && (
              <StatusCard
                icon={<ClockIcon className="w-4 h-4 text-blue-500" />}
                text={`Disponible el ${formatDate(exam.due_date)}`}
                bg="bg-blue-50 dark:bg-blue-950/20"
                border="border-blue-200 dark:border-blue-800"
                textColor="text-blue-700 dark:text-blue-300"
              />
            )}
            {!answered && isToday && (
              <StatusCard
                icon={<SparklesIcon className="w-4 h-4 text-yellow-500" />}
                text="Hoy disponible"
                bg="bg-yellow-50 dark:bg-yellow-950/20"
                border="border-yellow-200 dark:border-yellow-800"
                textColor="text-yellow-700 dark:text-yellow-300"
              />
            )}
            {!answered && isAfter && (
              <StatusCard
                icon={<BookOpenIcon className="w-4 h-4 text-red-500" />}
                text="Vencido"
                bg="bg-red-50 dark:bg-red-950/20"
                border="border-red-200 dark:border-red-800"
                textColor="text-red-700 dark:text-red-300"
              />
            )}
            {answered && (
              <StatusCard
                icon={<CheckIcon className="w-4 h-4 text-green-500" />}
                text="Completado"
                bg="bg-green-50 dark:bg-green-950/20"
                border="border-green-200 dark:border-green-800"
                textColor="text-green-700 dark:text-green-300"
              />
            )}
          </div>
        )}
        {/* Indicador de rol para no estudiantes */}
        {!isStudent && (
          <div className="text-sm">
            <StatusCard
              icon={<IdentificationIcon className="w-4 h-4 text-gray-500" />}
              text="Solo visualización"
              bg="bg-gray-50 dark:bg-gray-950/20"
              border="border-gray-200 dark:border-gray-800"
              textColor="text-gray-700 dark:text-gray-300"
            />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>Entrega: {formatDate(exam.due_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4" />
          <span>{subjectName}</span>
        </div>
      </div>

      {/* Acción - Solo para estudiantes */}
      <div className="text-end">
        {isStudent && answered !== true && isToday && (
          <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenQuestions}
                disabled={questionsLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2"
              >
                {questionsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
                <span>{questionsLoading ? "Cargando..." : "Comenzar"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogTitle className="text-2xl font-semibold mb-4">
                Autoevaluación: {exam.task}
              </DialogTitle>
              {questionsError && (
                <p className="text-red-600 mb-4">{questionsError}</p>
              )}
              {mcQuestions.map((q, i) => (
                <div key={i} className="mb-6">
                  <p className="font-medium mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <RadioGroup
                    value={answers[i] ?? ""}
                    onValueChange={(v) => handleChange(i, v)}
                    className="space-y-3"
                  >
                    {q.options.map((opt: string, idx: number) => (
                      <label
                        key={idx}
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={opt}
                          checked={answers[i] === opt}
                          onChange={() => handleChange(i, opt)}
                          className="h-4 w-4 text-indigo-600 mr-3"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || answers.some((a) => !a)}
                >
                  {submitting ? "Enviando..." : "Enviar respuestas"}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
              </div>
              {result && (
                <p
                  className={`mt-4 p-3 rounded-lg text-sm border ${
                    result.includes("correctamente")
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700"
                  }`}
                >
                  {result}
                </p>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
