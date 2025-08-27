"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface AnswerProps {
  assessmentId: number;
  questions: string[];
  onClose: () => void;
}

const COLORS = {
  primary: "#ff9800", // naranja institucional
  secondary: "#1b1b1b", // fondo oscuro
  selected: "#ffe0b2", // naranja claro
  correct: "#43a047", // verde
  border: "#ff9800",
};

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
        alert("Respuestas enviadas correctamente");
        onClose();
      } else {
        alert("Hubo un problema al enviar las respuestas");
      }
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
      alert("Error de red o del servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones de ejemplo (puedes adaptar para opciones reales si las tienes)
  const options = ["Opción A", "Opción B", "Opción C", "Opción D"];

  return (
    <div
      style={{
        background: "var(--background, #fff8f0)",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: 32,
        maxWidth: 420,
        margin: "40px auto",
        border: `2px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ color: COLORS.primary, fontWeight: 700, fontSize: 18 }}>
          Pregunta {current + 1} de {questions.length}
        </span>
        <button
          onClick={onClose}
          style={{
            color: COLORS.primary,
            background: "none",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 20,
          marginBottom: 24,
          color: COLORS.secondary,
        }}
      >
        {questions[current]}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleChange(opt)}
            style={{
              padding: "14px 18px",
              borderRadius: 10,
              border:
                answers[current] === opt
                  ? `2px solid ${COLORS.primary}`
                  : "1px solid #ddd",
              background: answers[current] === opt ? COLORS.selected : "#fff",
              color:
                answers[current] === opt ? COLORS.primary : COLORS.secondary,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s",
              outline: "none",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Anterior
        </Button>
        {current < questions.length - 1 ? (
          <Button
            style={{
              background: COLORS.primary,
              color: "#fff",
              fontWeight: 700,
            }}
            disabled={!answers[current]}
            onClick={() =>
              setCurrent((c) => Math.min(questions.length - 1, c + 1))
            }
          >
            Siguiente
          </Button>
        ) : (
          <Button
            style={{
              background: COLORS.primary,
              color: "#fff",
              fontWeight: 700,
            }}
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
