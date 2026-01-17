"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import axios from "axios";
import {
  Calendar,
  BookOpen,
  Play,
  Check,
  Clock,
  Sparkles,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SelfAssessableExam } from "@/utils/types";
import { toast } from "sonner";
import { parseLocalDate } from "@/utils/dateHelpers";
import { cn } from "@/lib/utils";

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

  const isStudent = role === "student";

  // Date handling
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = parseLocalDate(exam.due_date);
  const dueOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const isBefore = todayOnly < dueOnly;
  const isToday = todayOnly.getTime() === dueOnly.getTime();
  const isAfter = todayOnly > dueOnly;

  const cleanSubjectName = (name: string) => {
    return name.replace(/\s*-\s*\d+°\d+\s*$/, "").trim();
  };

  const checkIfAnswered = useCallback(async () => {
    if (!exam.id || !isStudent) return setAnswered(false);
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/proxy/get-if-selfassessable-answered/`,
        { selfassessable_id: exam.id },
        { withCredentials: true }
      );
      const data = res.data;
      let isAnswered = false;
      if (typeof data === "boolean") isAnswered = data;
      else if (typeof data === "string") isAnswered = data.toLowerCase() === "true";
      else if (typeof data === "number") isAnswered = data === 1;
      else if (data && typeof data === "object")
        isAnswered = data.answered || data.is_answered || data.completed || false;
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

  const handleOpenQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const res = await axios.get(`/api/proxy/selfassessables/?assessment_id=${exam.id}`, {
        withCredentials: true,
      });
      const arr = Array.isArray(res.data) ? res.data : [];
      if (arr.length) setQuestions(arr);
      else throw new Error("Sin preguntas");
    } catch {
      setQuestionsError("No hay preguntas para este autoevaluable.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleChange = (idx: number, value: string) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

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
        setResult("Respuestas enviadas correctamente");
        toast.success("Autoevaluacion completada");
        await checkIfAnswered();
        setTimeout(() => setShowQuestions(false), 1200);
      } else {
        setResult("Error al enviar respuestas");
        toast.error("Error al procesar respuestas");
      }
    } catch {
      setResult("Error de red o servidor");
      toast.error("Error de conexion");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatus = () => {
    if (answered) return { label: "Completado", color: "bg-success-muted text-success border-border", icon: Check };
    if (isBefore) return { label: "Pendiente", color: "bg-surface-muted text-text-secondary border-border", icon: Clock };
    if (isToday) return { label: "Disponible", color: "bg-primary/10 text-primary border-border", icon: Sparkles };
    return { label: "Vencido", color: "bg-error-muted text-error border-border", icon: AlertCircle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (loading) {
    return <div className="minimal-card animate-pulse h-32" />;
  }

  return (
    <div className="minimal-card hover:border-foreground/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{exam.task}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {cleanSubjectName(subjectName)}
          </p>
        </div>
        {isStudent && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium shrink-0",
              status.color
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        )}
        {!isStudent && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-surface-muted text-text-secondary text-xs font-medium">
            <User className="h-3 w-3" />
            Vista
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>
            {dueDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{cleanSubjectName(subjectName)}</span>
        </div>
      </div>

      {/* Action */}
      {isStudent && answered !== true && isToday && (
        <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={handleOpenQuestions}
              disabled={questionsLoading}
              className="w-full gap-1.5"
            >
              {questionsLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {questionsLoading ? "Cargando..." : "Comenzar"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogTitle className="text-lg font-semibold mb-4">{exam.task}</DialogTitle>

            {questionsError && (
              <div className="p-3 rounded bg-error-muted text-error text-sm mb-4">
                {questionsError}
              </div>
            )}

            {mcQuestions.map((q, i) => (
              <div key={i} className="mb-6">
                <p className="font-medium text-sm mb-3">
                  {i + 1}. {q.question}
                </p>
                <RadioGroup
                  value={answers[i] ?? ""}
                  onValueChange={(v) => handleChange(i, v)}
                  className="space-y-2"
                >
                  {q.options.map((opt: string, idx: number) => (
                    <label
                      key={idx}
                      className={cn(
                        "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                        answers[i] === opt
                          ? "border-foreground bg-accent"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <input
                        type="radio"
                        value={opt}
                        checked={answers[i] === opt}
                        onChange={() => handleChange(i, opt)}
                        className="h-4 w-4 mr-3"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || answers.some((a) => !a)}
              >
                {submitting ? "Enviando..." : "Enviar"}
              </Button>
            </div>

            {result && (
              <p
                className={cn(
                  "mt-4 p-3 rounded text-sm",
                  result.includes("correctamente")
                    ? "bg-success-muted text-success"
                    : "bg-error-muted text-error"
                )}
              >
                {result}
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}

      {isStudent && answered === true && (
        <div className="text-center py-2">
          <span className="text-xs text-success flex items-center justify-center gap-1">
            <Check className="h-3 w-3" />
            Ya completaste esta autoevaluacion
          </span>
        </div>
      )}

      {isStudent && !isToday && !answered && (
        <div className="text-center py-2">
          <span className="text-xs text-text-secondary">
            {isBefore ? `Disponible el ${dueDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}` : "Ya no disponible"}
          </span>
        </div>
      )}
    </div>
  );
}
