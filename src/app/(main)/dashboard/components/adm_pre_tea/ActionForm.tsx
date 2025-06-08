"use client";

import { useState } from "react";
import {
  FormsObj,
  MessageForm,
  ExamForm,
  SelfAssessableExamForm,
  MessagePayload,
  ExamPayload,
  TaskPayload,
  SelfAssessablePayload,
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
        questions: [""],
        correct: [""],
        incorrect1: [""],
        incorrect2: [""],
      } as ExamForm;
    }
  };

  const [formData, setFormData] = useState<FormsObj[typeof action]>(
    getInitialState()
  );
  const [isLoading, setIsLoading] = useState(false);

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

  // Manejo de cambios para arrays (solo para formularios de examen autoevaluable)
  const handleArrayChange = (
    field: keyof Pick<
      SelfAssessableExamForm,
      "questions" | "correct" | "incorrect1" | "incorrect2"
    >,
    index: number,
    value: string
  ) => {
    if (isExamForm(formData) && isSelfAssessableExamForm(formData)) {
      const updatedArray = [...formData[field]];
      updatedArray[index] = value;
      setFormData({
        ...formData,
        [field]: updatedArray,
      });
    }
  };

  // Agregar elemento al array
  const handleAddArrayItem = (
    field: keyof Pick<
      SelfAssessableExamForm,
      "questions" | "correct" | "incorrect1" | "incorrect2"
    >
  ) => {
    if (isExamForm(formData) && isSelfAssessableExamForm(formData)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], ""],
      });
    }
  };

  // Remover elemento del array
  const handleRemoveArrayItem = (
    field: keyof Pick<
      SelfAssessableExamForm,
      "questions" | "correct" | "incorrect1" | "incorrect2"
    >,
    index: number
  ) => {
    if (isExamForm(formData) && isSelfAssessableExamForm(formData)) {
      const updatedArray = [...formData[field]];
      updatedArray.splice(index, 1);
      setFormData({
        ...formData,
        [field]: updatedArray,
      });
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
        const taskPayload: TaskPayload = {
          subject: Number(formData.subject),
          task: formData.task,
          due_date: formData.due_date,
          type: formData.type,
        };

        if (isSelfAssessableExamForm(formData)) {
          const selfAssessablePayload: SelfAssessablePayload = {
            questions: formData.questions,
            correct: formData.correct,
            incorrect1: formData.incorrect1,
            incorrect2: formData.incorrect2,
          };

          payload = {
            newtask: taskPayload,
            newselfassessable: selfAssessablePayload,
          } satisfies ExamPayload;
        } else {
          payload = {
            newtask: taskPayload,
          } satisfies ExamPayload;
        }

        url = "http://localhost:8080/api/v1/assessments/";
      } else {
        throw new Error("Tipo de formulario no válido");
      }

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 201 || response.status === 200) {
        alert("Creación exitosa");
        onClose();
      } else {
        alert("Error en la creación");
      }
    } catch (error) {
      console.error(error);
      alert("Error en la creación");
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
            <>
              {(
                ["questions", "correct", "incorrect1", "incorrect2"] as const
              ).map((field) => (
                <div key={field} className="mb-4">
                  <h3 className="font-semibold mb-1 capitalize">
                    {field === "questions"
                      ? "Preguntas"
                      : field === "correct"
                      ? "Respuestas correctas"
                      : field === "incorrect1"
                      ? "Respuestas incorrectas 1"
                      : "Respuestas incorrectas 2"}
                  </h3>
                  {formData[field].map((value, idx) => (
                    <div key={idx} className="flex items-center space-x-2 mb-2">
                      <Input
                        placeholder={`${field} #${idx + 1}`}
                        value={value}
                        onChange={(e) =>
                          handleArrayChange(field, idx, e.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveArrayItem(field, idx)}
                        disabled={formData[field].length === 1}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddArrayItem(field)}
                  >
                    + Agregar{" "}
                    {field === "questions"
                      ? "pregunta"
                      : field === "correct"
                      ? "respuesta correcta"
                      : "respuesta incorrecta"}
                  </Button>
                </div>
              ))}
            </>
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
