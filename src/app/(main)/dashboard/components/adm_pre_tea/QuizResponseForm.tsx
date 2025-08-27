import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

interface QuizResponseFormProps {
  examId: string;
  questions: string[];
  correct: string[];
  incorrect1: string[];
  incorrect2: string[];
  onComplete: () => void;
}

export function QuizResponseForm({
  examId,
  questions,
  correct,
  incorrect1,
  incorrect2,
  onComplete,
}: QuizResponseFormProps) {
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => !answer)) {
      toast.error("Por favor responde todas las preguntas");
      return;
    }

    setIsSubmitting(true);
    try {

      await axios.post(
        `/api/proxy/selfassessables/`,
        {
          assessment_id: parseInt(examId),
          answers,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Tus respuestas han sido enviadas correctamente");
      onComplete();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(
        "Hubo un error al enviar tus respuestas. Por favor intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <Card key={index} className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Pregunta {index + 1}: {question}
          </h3>
          <RadioGroup
            value={answers[index]}
            onValueChange={(value) => handleAnswerChange(index, value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={correct[index]} id={`correct-${index}`} />
              <Label htmlFor={`correct-${index}`}>{correct[index]}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={incorrect1[index]}
                id={`incorrect1-${index}`}
              />
              <Label htmlFor={`incorrect1-${index}`}>{incorrect1[index]}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={incorrect2[index]}
                id={`incorrect2-${index}`}
              />
              <Label htmlFor={`incorrect2-${index}`}>{incorrect2[index]}</Label>
            </div>
          </RadioGroup>
        </Card>
      ))}

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando..." : "Enviar respuestas"}
      </Button>
    </div>
  );
}
