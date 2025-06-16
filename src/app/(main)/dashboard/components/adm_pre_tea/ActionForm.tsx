"use client";

import { useState } from "react";
import {
  FormsObj,
  MessageForm,
  ExamForm,
  SelfAssessableExamForm,
  MessagePayload,
  ExamPayload,
} from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

interface ActionFormProps {
  action: keyof FormsObj;
  onBack: () => void;
  onClose: () => void;
}

export const ActionForm = ({ action, onBack, onClose }: ActionFormProps) => {
  // Estados iniciales más específicos
  const getInitialState = (): FormsObj[typeof action] => {
    if (action === "Crear mensaje") {
      return { title: "", message: "", courses: "" } as MessageForm;
    } else {
      return {
        subject: "",
        task: "",
        due_date: "",
        type: "oral",
        questions: Array(10).fill(""),
        correct: Array(10).fill(""),
        incorrect1: Array(10).fill(""),
        incorrect2: Array(10).fill(""),
      } as ExamForm;
    }
  };

  const [formData, setFormData] = useState<FormsObj[typeof action]>(
    getInitialState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Type guards para verificar el tipo de formulario
  const isMessageForm = (
    data: FormsObj[typeof action]
  ): data is MessageForm => {
    return action === "Crear mensaje";
  };

  const isExamForm = (data: FormsObj[typeof action]): data is ExamForm => {
    return action === "Crear examen";
  };

  const isSelfAssessableExamForm = (
    data: ExamForm
  ): data is SelfAssessableExamForm => {
    return data.type === "selfassessable";
  };

  // Manejo de cambios para campos individuales
  const handleChange = <T extends FormsObj[typeof action]>(
    field: keyof T,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  type ArrayField = "questions" | "correct" | "incorrect1" | "incorrect2";

  const handleArrayChange = (
    field: ArrayField,
    index: number,
    value: string
  ) => {
    if (isExamForm(formData) && isSelfAssessableExamForm(formData)) {
      const examData = formData as SelfAssessableExamForm;
      setFormData({
        ...examData,
        [field]: examData[field].map((item, i) => (i === index ? value : item)),
      });
    }
  };

  const isQuestionComplete = (index: number) => {
    if (!isExamForm(formData) || !isSelfAssessableExamForm(formData))
      return false;
    const examData = formData as SelfAssessableExamForm;
    return (
      examData.questions[index] &&
      examData.correct[index] &&
      examData.incorrect1[index] &&
      examData.incorrect2[index]
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let payload: MessagePayload | ExamPayload;
      let url: string;

      if (action === "Crear mensaje" && isMessageForm(formData)) {
        payload = {
          title: formData.title,
          message: formData.message,
          courses: formData.courses,
        } satisfies MessagePayload;
        url = "http://localhost:8080/api/v1/messages/";
      } else if (action === "Crear examen" && isExamForm(formData)) {
        if (isSelfAssessableExamForm(formData)) {
          // Verificar que todas las preguntas estén completas
          const allQuestionsComplete = formData.questions.every((_, index) =>
            isQuestionComplete(index)
          );

          if (!allQuestionsComplete) {
            toast.error(
              "Por favor completa todas las preguntas antes de enviar"
            );
            setIsLoading(false);
            return;
          }

          payload = {
            newtask: {
              subject: Number(formData.subject),
              task: formData.task,
              due_date: formData.due_date,
              type: "selfassessable",
            },
            newselfassessable: {
              questions: formData.questions,
              correct: formData.correct,
              incorrect1: formData.incorrect1,
              incorrect2: formData.incorrect2,
            },
          } satisfies ExamPayload;
          url = "http://localhost:8080/api/v1/assessments/";
        } else {
          payload = {
            newtask: {
              subject: Number(formData.subject),
              task: formData.task,
              due_date: formData.due_date,
              type: formData.type,
            },
          } satisfies ExamPayload;
          url = "http://localhost:8080/api/v1/assessments/";
        }
      } else {
        throw new Error("Tipo de formulario no válido");
      }

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Examen creado exitosamente");
        onClose();
      } else {
        toast.error("Error en la creación");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error en la creación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{action}</h2>

      {/* Formulario para mensajes */}
      {action === "Crear mensaje" && isMessageForm(formData) && (
        <>
          <Input
            placeholder="Título"
            value={formData.title}
            onChange={(e) => handleChange<MessageForm>("title", e.target.value)}
          />
          <Input
            placeholder="Mensaje"
            value={formData.message}
            onChange={(e) =>
              handleChange<MessageForm>("message", e.target.value)
            }
          />
          <Input
            placeholder="Cursos"
            value={formData.courses}
            onChange={(e) =>
              handleChange<MessageForm>("courses", e.target.value)
            }
          />
        </>
      )}

      {/* Formulario para exámenes */}
      {action === "Crear examen" && isExamForm(formData) && (
        <>
          <Input
            placeholder="ID materia (subject)"
            type="number"
            value={formData.subject}
            onChange={(e) => handleChange<ExamForm>("subject", e.target.value)}
          />
          <Input
            placeholder="Nombre de la evaluación"
            value={formData.task}
            onChange={(e) => handleChange<ExamForm>("task", e.target.value)}
          />
          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange<ExamForm>("due_date", e.target.value)}
          />
          <Select
            value={formData.type}
            onValueChange={(value: "oral" | "selfassessable") =>
              handleChange<ExamForm>("type", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de evaluación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral">Oral / Tradicional</SelectItem>
              <SelectItem value="selfassessable">
                Autoevaluable (quiz)
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Campos adicionales para exámenes autoevaluables */}
          {isSelfAssessableExamForm(formData) && (
            <div className="space-y-6 mt-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Configuración del Quiz - Pregunta {currentQuestion + 1} de 10
                </h3>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pregunta
                      </label>
                      <Input
                        placeholder="Escribe la pregunta"
                        value={formData.questions[currentQuestion]}
                        onChange={(e) =>
                          handleArrayChange(
                            "questions",
                            currentQuestion,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Respuesta correcta
                      </label>
                      <Input
                        placeholder="Respuesta correcta"
                        value={formData.correct[currentQuestion]}
                        onChange={(e) =>
                          handleArrayChange(
                            "correct",
                            currentQuestion,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opción incorrecta 1
                      </label>
                      <Input
                        placeholder="Primera opción incorrecta"
                        value={formData.incorrect1[currentQuestion]}
                        onChange={(e) =>
                          handleArrayChange(
                            "incorrect1",
                            currentQuestion,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opción incorrecta 2
                      </label>
                      <Input
                        placeholder="Segunda opción incorrecta"
                        value={formData.incorrect2[currentQuestion]}
                        onChange={(e) =>
                          handleArrayChange(
                            "incorrect2",
                            currentQuestion,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={
                      currentQuestion === 9 ||
                      !isQuestionComplete(currentQuestion)
                    }
                  >
                    Siguiente
                  </Button>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  {Array(10)
                    .fill(0)
                    .map((_, index) => (
                      <Button
                        key={index}
                        variant={
                          currentQuestion === index ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentQuestion(index)}
                        className={
                          isQuestionComplete(index) ? "bg-green-100" : ""
                        }
                      >
                        {index + 1}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Enviando..." : "Crear"}
        </Button>
      </div>
    </div>
  );
};

export default ActionForm;
