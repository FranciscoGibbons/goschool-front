"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnswerProps {
  assessmentId: number;
  questions: string[];
  onClose: () => void; // nuevo
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

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/selfassessables/",
        {
          assessment_id: assessmentId,
          answers,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        alert("Respuestas enviadas correctamente");
        onClose(); // cerrar al enviar correctamente
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

  return (
    <div className="space-y-4 mt-6 border-t pt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-blue-900">
          Responder evaluación
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-blue-500 hover:underline"
        >
          Cancelar
        </button>
      </div>

      {questions.map((q, idx) => (
        <div key={idx} className="space-y-1">
          <p className="font-medium">
            {idx + 1}. {q}
          </p>
          <Input
            placeholder="Tu respuesta"
            value={answers[idx]}
            onChange={(e) => handleChange(idx, e.target.value)}
          />
        </div>
      ))}

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar respuestas"}
      </Button>
    </div>
  );
}
//               