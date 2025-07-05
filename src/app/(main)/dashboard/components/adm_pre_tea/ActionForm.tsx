"use client";

import { useState, useEffect } from "react";
import {
  FormsObj,
  MessageForm,
  ExamForm,
  SelfAssessableExamForm,
  GradeForm,
  SubjectMessageForm,
  MessagePayload,
  ExamPayload,
  GradePayload,
} from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    } else if (action === "Crear examen") {
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
    } else if (action === "Cargar calificación") {
      return {
        subject: "",
        assessment_id: "",
        student_id: "",
        grade_type: "numerical",
        description: "",
        grade: "",
      } as GradeForm;
    } else if (action === "Crear mensaje de materia") {
      return {
        subject_id: "",
        title: "",
        content: "",
        type: "message" as "message" | "file",
      } as SubjectMessageForm;
    } else {
      return { title: "", message: "", courses: "" } as MessageForm;
    }
  };

  const [formData, setFormData] = useState<FormsObj[typeof action]>(
    getInitialState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

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

  const isGradeForm = (data: FormsObj[typeof action]): data is GradeForm => {
    return action === "Cargar calificación";
  };

  const isSubjectMessageForm = (
    data: FormsObj[typeof action]
  ): data is SubjectMessageForm => {
    return action === "Crear mensaje de materia";
  };

  // Función para cargar materias
  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/subjetcs/",
        {
          withCredentials: true,
        }
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast.error("Error al cargar materias");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Cargar materias cuando se necesite
  useEffect(() => {
    if (
      action === "Cargar calificación" ||
      action === "Crear mensaje de materia"
    ) {
      loadSubjects();
    }
  }, [action]);

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
      // Validación básica para mensajes de materia
      if (
        action === "Crear mensaje de materia" &&
        isSubjectMessageForm(formData)
      ) {
        if (!formData.subject_id || !formData.title || !formData.content) {
          toast.error("Por favor completa todos los campos requeridos");
          setIsLoading(false);
          return;
        }
      }

      let payload: MessagePayload | ExamPayload | GradePayload | FormData;
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
      } else if (action === "Cargar calificación" && isGradeForm(formData)) {
        payload = {
          subject: Number(formData.subject),
          assessment_id: Number(formData.assessment_id),
          student_id: Number(formData.student_id),
          grade_type: formData.grade_type,
          description: formData.description,
          grade:
            formData.grade_type === "numerical"
              ? Number(formData.grade)
              : formData.grade,
        } satisfies GradePayload;
        url = "http://localhost:8080/api/v1/grades/";
      } else if (
        action === "Crear mensaje de materia" &&
        isSubjectMessageForm(formData)
      ) {
        const formDataToSend = new FormData();
        formDataToSend.append("subject_id", formData.subject_id);
        formDataToSend.append("title", formData.title);
        formDataToSend.append("content", formData.content);
        formDataToSend.append("type", formData.type);

        // Debug: verificar el tipo exacto que se está enviando
        console.log(
          "Tipo que se está enviando:",
          formData.type,
          "tipo de dato:",
          typeof formData.type
        );

        if (formData.file) {
          formDataToSend.append("file", formData.file);
        }

        // Debug: mostrar qué se está enviando
        console.log("Enviando mensaje de materia:", {
          subject_id: formData.subject_id,
          title: formData.title,
          content: formData.content,
          type: formData.type,
          hasFile: !!formData.file,
        });

        // Debug: mostrar el FormData
        console.log("FormData entries:");
        for (const [key, value] of formDataToSend.entries()) {
          console.log(`${key}: ${value} (type: ${typeof value})`);
        }

        payload = formDataToSend;
        url = "http://localhost:8080/api/v1/subject_messages/";
      } else {
        throw new Error("Tipo de formulario no válido");
      }

      const response = await axios.post(url, payload, {
        headers:
          action === "Crear mensaje de materia"
            ? {}
            : { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 201 || response.status === 200) {
        const successMessage =
          action === "Cargar calificación"
            ? "Calificación cargada exitosamente"
            : action === "Crear mensaje de materia"
            ? "Mensaje de materia creado exitosamente"
            : "Examen creado exitosamente";
        toast.success(successMessage);
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

      {/* Formulario para calificaciones */}
      {action === "Cargar calificación" && isGradeForm(formData) && (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Materia</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  handleChange<GradeForm>("subject", value)
                }
                disabled={isLoadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingSubjects
                        ? "Cargando materias..."
                        : "Selecciona una materia"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assessment_id">ID de Evaluación</Label>
              <Input
                id="assessment_id"
                placeholder="ID de la evaluación"
                type="number"
                value={formData.assessment_id}
                onChange={(e) =>
                  handleChange<GradeForm>("assessment_id", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="student_id">ID del Estudiante</Label>
              <Input
                id="student_id"
                placeholder="ID del estudiante"
                type="number"
                value={formData.student_id}
                onChange={(e) =>
                  handleChange<GradeForm>("student_id", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="grade_type">Tipo de Nota</Label>
              <Select
                value={formData.grade_type}
                onValueChange={(value: "numerical" | "conceptual") =>
                  handleChange<GradeForm>("grade_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de nota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numerical">Numérica (1-10)</SelectItem>
                  <SelectItem value="conceptual">
                    Conceptual (MB, B, R, I)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Descripción de la nota"
                value={formData.description}
                onChange={(e) =>
                  handleChange<GradeForm>("description", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="grade">Nota</Label>
              <Input
                id="grade"
                placeholder={formData.grade_type === "numerical" ? "7.5" : "MB"}
                value={formData.grade}
                onChange={(e) =>
                  handleChange<GradeForm>("grade", e.target.value)
                }
              />
            </div>
          </div>
        </>
      )}

      {/* Formulario para mensajes de materia */}
      {action === "Crear mensaje de materia" &&
        isSubjectMessageForm(formData) && (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject_id">Materia</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) =>
                    handleChange<SubjectMessageForm>("subject_id", value)
                  }
                  disabled={isLoadingSubjects}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingSubjects
                          ? "Cargando materias..."
                          : "Selecciona una materia"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Título del mensaje"
                  value={formData.title}
                  onChange={(e) =>
                    handleChange<SubjectMessageForm>("title", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "message" | "file") =>
                    handleChange<SubjectMessageForm>("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de mensaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Mensaje</SelectItem>
                    <SelectItem value="file">Archivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  placeholder="Contenido del mensaje"
                  value={formData.content}
                  onChange={(e) =>
                    handleChange<SubjectMessageForm>("content", e.target.value)
                  }
                />
              </div>

              {formData.type === "file" && (
                <div>
                  <Label htmlFor="file">Archivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          file,
                        } as SubjectMessageForm);
                      }
                    }}
                  />
                </div>
              )}
            </div>
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
