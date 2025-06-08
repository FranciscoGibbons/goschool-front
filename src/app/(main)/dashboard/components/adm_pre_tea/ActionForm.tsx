"use client";

import { useState } from "react";
import { FormsObj } from "@/utils/types";
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
  const initialState: FormsObj[typeof action] =
    action === "Crear mensaje"
      ? { title: "", message: "", courses: "" }
      : {
          subject: "",
          task: "",
          due_date: "",
          type: "oral",
          questions: [""],
          correct: [""],
          incorrect1: [""],
          incorrect2: [""],
        };

  const [formData, setFormData] =
    useState<FormsObj[typeof action]>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = <K extends keyof FormsObj[typeof action]>(
    field: K,
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleArrayChange = (
    field: "questions" | "correct" | "incorrect1" | "incorrect2",
    index: number,
    value: string
  ) => {
    if ("questions" in formData) {
      const updatedArray = [...formData[field]];
      updatedArray[index] = value;
      setFormData({
        ...formData,
        [field]: updatedArray,
      });
    }
  };

  const handleAddArrayItem = (
    field: "questions" | "correct" | "incorrect1" | "incorrect2"
  ) => {
    if ("questions" in formData) {
      setFormData({
        ...formData,
        [field]: [...formData[field], ""],
      });
    }
  };

  const handleRemoveArrayItem = (
    field: "questions" | "correct" | "incorrect1" | "incorrect2",
    index: number
  ) => {
    if ("questions" in formData) {
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
      let payload: any;
      if (action === "Crear mensaje") {
        payload = formData;
      } else if (action === "Crear examen" && "questions" in formData) {
        payload = {
          newtask: {
            subject: Number(formData.subject),
            task: formData.task,
            due_date: formData.due_date,
            type: formData.type,
          },
        };
        if (formData.type === "selfassessable") {
          payload.newselfassessable = {
            questions: formData.questions,
            correct: formData.correct,
            incorrect1: formData.incorrect1,
            incorrect2: formData.incorrect2,
          };
        }
      }

      const url =
        action === "Crear mensaje"
          ? "http://localhost:8080/api/v1/messages/"
          : "http://localhost:8080/api/v1/assessments/";

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

      {action === "Crear mensaje" &&
        (Object.keys(formData) as Array<keyof FormsObj["Crear mensaje"]>).map(
          (key) => (
            <Input
              key={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          )
        )}

      {action === "Crear examen" && "questions" in formData && (
        <>
          <Input
            placeholder="ID materia (subject)"
            type="number"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
          />
          <Input
            placeholder="Nombre de la evaluación"
            value={formData.task}
            onChange={(e) => handleChange("task", e.target.value)}
          />
          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange("due_date", e.target.value)}
          />
          <Select
            value={formData.type}
            onValueChange={(value) =>
              handleChange("type" as keyof FormsObj["Crear examen"], value)
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

          {formData.type === "selfassessable" && (
            <>
              {(
                ["questions", "correct", "incorrect1", "incorrect2"] as const
              ).map((field) => (
                <div key={field} className="mb-4">
                  <h3 className="font-semibold mb-1 capitalize">{field}</h3>
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
                    + Agregar {field}
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
