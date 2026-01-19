"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/sacred";
import { toast } from "sonner";


interface AnswerProps {
  assessmentId: number;
  questions: string[];
  onClose: () => void;
}



export default function AnswerSelfAssessable({
  assessmentId,
  questions,
  onClose,
}: AnswerProps) {
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);

  const handleChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[current] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `/api/proxy/selfassessables/`,
        {
          assessment_id: assessmentId,
          answers,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.status === 201) {
        toast.success("Respuestas enviadas correctamente");
        onClose();
      } else {
        toast.error("Hubo un problema al enviar las respuestas");
      }
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
      toast.error("Error de red o del servidor");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Opciones de ejemplo (puedes adaptar para opciones reales si las tienes)
  const options = ["Opción A", "Opción B", "Opción C", "Opción D"];

  return (
    <div className="sacred-card max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-text-primary">
          Pregunta {current + 1} de {questions.length}
        </span>
        <button
          onClick={onClose}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cerrar
        </button>
      </div>
      <div className="text-lg font-semibold text-text-primary mb-6">
        {questions[current]}
      </div>
      <div className="flex flex-col gap-3 mb-6">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleChange(opt)}
            className={`text-left px-4 py-3 rounded-md border transition-colors ${
              answers[current] === opt
                ? "border-primary/40 bg-surface-muted text-text-primary"
                : "border-border bg-background hover:bg-surface-muted"
            }`}
          >
            <span className="text-sm font-medium">{opt}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Anterior
        </Button>
        {current < questions.length - 1 ? (
          <Button
            disabled={!answers[current]}
            onClick={() =>
              setCurrent((c) => Math.min(questions.length - 1, c + 1))
            }
          >
            Siguiente
          </Button>
        ) : (
          <Button
            disabled={answers.some((a) => !a) || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Enviando..." : "Enviar respuestas"}
          </Button>
        )}
      </div>
    </div>

  );
}
