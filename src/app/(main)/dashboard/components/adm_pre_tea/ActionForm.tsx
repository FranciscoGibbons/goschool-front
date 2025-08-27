"use client";

import { useState, useEffect, useRef } from "react";
import {
  FormsObj,
  MessageForm,
  ExamForm,
  SelfAssessableExamForm,
  GradeForm,
  SubjectMessageForm,
} from "@/utils/types";
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
import { toast } from "sonner";
import axios from "axios";

// Función simple para construir URLs con parámetros para rutas proxy
const buildProxyUrl = (path: string, params?: Record<string, string | number | boolean>): string => {
  let url = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return url;
};
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

// Tipos para los datos dinámicos
interface Assessment {
  id: number;
  task: string;
  subject_id: number;
  due_date: string;
  type: string;
}

interface Student {
  id: number;
  full_name: string;
  photo?: string;
}

interface ActionFormProps {
  action: keyof FormsObj;
  onBack: () => void;
  onClose: () => void;
}

type SubjectWithCourseName = {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
  course_name?: string;
};

export const ActionForm = ({ action, onBack, onClose }: ActionFormProps) => {
  // Estados iniciales más específicos
  const getInitialState = (): FormsObj[typeof action] => {
    if (action === "Crear mensaje") {
      return { title: "", message: "", courses: [] } as MessageForm;
    } else if (action === "Crear examen") {
      return {
        subject: "",
        task: "",
        due_date: "",
        type: "exam",
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
        type: "message" as "message" | "file" | "link",
      } as SubjectMessageForm;
    } else {
      return { title: "", message: "", courses: [] } as MessageForm;
    }
  };

  const [formData, setFormData] = useState<FormsObj[typeof action]>(
    getInitialState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Estado local para materias con información de cursos
  const [subjects, setSubjects] = useState<SubjectWithCourseName[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  
  const [courses, setCourses] = useState<
    Array<{
      id: number;
      name: string;
      year: number;
      division: string;
      shift: string;
    }>
  >([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Nuevos estados para el formulario de calificaciones
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

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

  // Función para cargar materias con información de cursos
  const loadSubjectsWithCourses = async () => {
    try {
      setIsLoadingSubjects(true);
      
      console.log("Iniciando carga de materias y cursos...");
      
      const [subjectsData, coursesData] = await Promise.all([
        axios.get(`/api/proxy/subjects/`, { withCredentials: true }),
        axios.get(`/api/proxy/courses/`, { withCredentials: true }),
      ]);

      console.log("Respuesta de subjects:", subjectsData.data);
      console.log("Respuesta de courses:", coursesData.data);

      const subjectsProcessed: Array<{
        id: number;
        name: string;
        course_id: number;
      }> = subjectsData.data;
      const coursesProcessed: Array<{
        id: number;
        name: string;
        year: number;
        division: string;
        shift: string;
      }> = coursesData.data;

      console.log("Subjects data procesado:", subjectsProcessed);
      console.log("Courses data procesado:", coursesProcessed);

      // Crear un mapa de cursos para acceso rápido
      const coursesMap: Map<
        number,
        {
          id: number;
          name: string;
          year: number;
          division: string;
          shift: string;
        }
      > = new Map(
        coursesProcessed.map(
          (course: {
            id: number;
            name: string;
            year: number;
            division: string;
            shift: string;
          }) => [course.id, course]
        )
      );

      console.log("Courses map creado:", Array.from(coursesMap.entries()));

      // Agregar información del curso a cada materia
      const subjectsWithCourses: SubjectWithCourseName[] = subjectsProcessed.map(
        (subject: { id: number; name: string; course_id: number }) => ({
          ...subject,
          teacher_id: 0, // Valor dummy para cumplir con el tipo Subject
          course_name: coursesMap.get(subject.course_id)
            ? `${coursesMap.get(subject.course_id)!.year}°${
                coursesMap.get(subject.course_id)!.division
              }`
            : `Curso ${subject.course_id}`,
        })
      );

      console.log("Materias cargadas con cursos:", subjectsWithCourses);
      setSubjects(subjectsWithCourses);
    } catch (error) {
      console.error("Error loading subjects with courses:", error);
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      toast.error("Error al cargar materias");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Función para cargar evaluaciones de una materia
  const loadAssessments = async (subjectId: string) => {
    if (!subjectId) {
      setAssessments([]);
      return;
    }

    setIsLoadingAssessments(true);
    try {
      const assessmentsData = await axios.get(
        buildProxyUrl('/api/proxy/assessments/', { subject_id: subjectId }), {
          withCredentials: true,
        }
      );
      console.log("Respuesta de evaluaciones:", assessmentsData.data);
      setAssessments(assessmentsData.data);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Error al cargar evaluaciones");
      setAssessments([]);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  // Función para cargar estudiantes de un curso
  const loadStudents = async (courseId: number) => {
    if (!courseId) {
      setStudents([]);
      return;
    }

    setIsLoadingStudents(true);
    try {
      // Primero obtener los IDs de estudiantes del curso
      const studentsResponse = await axios.get(
        buildProxyUrl('/api/proxy/students/', { course_id: courseId }), {
          withCredentials: true,
        }
      );

      const studentIds = studentsResponse.data;
      console.log("IDs de estudiantes:", studentIds);

      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      // Luego obtener los datos personales de cada estudiante
      const personalDataPromises = studentIds.map((studentId: number) =>
        axios.get(
          buildProxyUrl('/api/proxy/public-personal-data/', { user_id: studentId }), {
            withCredentials: true,
          }
        )
      );

      const personalDataResponses = await Promise.all(personalDataPromises);
      const studentsData = personalDataResponses.map((response, index) => ({
        id: studentIds[index],
        full_name:
          response.data[0]?.full_name || `Estudiante ${studentIds[index]}`,
        photo: response.data[0]?.photo,
      }));

      console.log("Datos de estudiantes:", studentsData);
      // Remove duplicates by id
      const uniqueStudents = studentsData.filter(
        (student, idx, arr) => arr.findIndex((s) => s.id === student.id) === idx
      );
      setStudents(uniqueStudents);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Error al cargar estudiantes");
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Función para cargar cursos
  const loadCourses = async () => {
    setIsLoadingCourses(true);
    try {

      const response = await axios.get(
        `/api/proxy/courses/`, {
          withCredentials: true,
        }
      );
      setCourses(response.data);
      console.log("Cursos recibidos:", response.data);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Error al cargar cursos");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Cargar materias cuando se necesite
  useEffect(() => {
    if (
      action === "Cargar calificación" ||
      action === "Crear mensaje de materia" ||
      action === "Crear examen"
    ) {
      console.log("Cargando materias para action:", action);
      loadSubjectsWithCourses();
    }
  }, [action, loadSubjectsWithCourses]);

  // Cargar cursos cuando se necesite
  useEffect(() => {
    if (action === "Crear mensaje") {
      loadCourses();
    }
  }, [action]);

  // Ref to track previous subject for each effect
  const prevSubjectAssessmentsRef = useRef<string | null>(null);
  const prevSubjectStudentsRef = useRef<string | null>(null);

  // Effect to load assessments only when subject changes
  useEffect(() => {
    if (action === "Cargar calificación" && isGradeForm(formData)) {
      const subject = formData.subject;
      if (subject && subject !== prevSubjectAssessmentsRef.current) {
        loadAssessments(subject);
        setFormData((prev) =>
          isGradeForm(prev) ? { ...prev, assessment_id: "" } : prev
        );
        prevSubjectAssessmentsRef.current = subject;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, action]);

  // Effect to load students only when subject changes
  useEffect(() => {
    if (action === "Cargar calificación" && isGradeForm(formData)) {
      const subject = formData.subject;
      if (subject && subject !== prevSubjectStudentsRef.current) {
        const selectedSubject = subjects.find(
          (s) => s.id.toString() === subject
        );
        if (selectedSubject) {
          loadStudents(selectedSubject.course_id);
          setFormData((prev) =>
            isGradeForm(prev) ? { ...prev, student_id: "" } : prev
          );
        }
        prevSubjectStudentsRef.current = subject;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, subjects, action]);

  // Manejo de cambios para campos individuales
  const handleChange = <T extends FormsObj[typeof action]>(
    field: keyof T,
    value: T[keyof T]
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

  // Función para contar preguntas completas
  const getCompletedQuestionsCount = () => {
    if (!isExamForm(formData) || !isSelfAssessableExamForm(formData)) return 0;
    const examData = formData as SelfAssessableExamForm;
    return examData.questions.filter((_, index) => isQuestionComplete(index))
      .length;
  };

  // Función para verificar si se puede crear el autoevaluable (mínimo 3 preguntas)
  const canCreateSelfAssessable = () => {
    return getCompletedQuestionsCount() >= 3;
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

      let payload: unknown;
      let url: string;

      if (action === "Crear mensaje" && isMessageForm(formData)) {
        payload = {
          title: formData.title,
          message: formData.message,
          courses: Array.isArray(formData.courses)
            ? formData.courses.map(String).join(",")
            : String(formData.courses),
        };

        url = `/api/proxy/messages`;
      } else if (action === "Crear examen" && isExamForm(formData)) {
        if (isSelfAssessableExamForm(formData)) {
          // Verificar que al menos 3 preguntas estén completas
          if (!canCreateSelfAssessable()) {
            toast.error(
              `Por favor completa al menos 3 preguntas antes de enviar (${getCompletedQuestionsCount()}/3)`
            );
            setIsLoading(false);
            return;
          }

          // Filtrar solo las preguntas completas
          const completedQuestions = formData.questions.filter((_, index) =>
            isQuestionComplete(index)
          );
          const completedCorrect = formData.correct.filter((_, index) =>
            isQuestionComplete(index)
          );
          const completedIncorrect1 = formData.incorrect1.filter((_, index) =>
            isQuestionComplete(index)
          );
          const completedIncorrect2 = formData.incorrect2.filter((_, index) =>
            isQuestionComplete(index)
          );

          payload = {
            newtask: {
              subject: Number(formData.subject),
              task: formData.task,
              due_date: formData.due_date,
              type: "selfassessable",
            },
            newselfassessable: {
              questions: completedQuestions,
              correct: completedCorrect,
              incorrect1: completedIncorrect1,
              incorrect2: completedIncorrect2,
            },
          };

          url = `/api/proxy/assessments`;
        } else {
          payload = {
            newtask: {
              subject: Number(formData.subject),
              task: formData.task,
              due_date: formData.due_date,
              type: formData.type,
            },
          };

          url = `/api/proxy/assessments`;
        }
      } else if (action === "Cargar calificación" && isGradeForm(formData)) {
        // Validar que todos los campos requeridos estén presentes
        if (
          !formData.subject ||
          !formData.student_id ||
          !formData.grade ||
          !formData.description
        ) {
          toast.error("Por favor completa todos los campos requeridos");
          setIsLoading(false);
          return;
        }

        // Convertir grade_type al formato que espera el backend
        let gradeType: "numerical" | "conceptual" | "percentage";
        switch (formData.grade_type) {
          case "numerical":
            gradeType = "numerical";
            break;
          case "conceptual":
            gradeType = "conceptual";
            break;
          default:
            gradeType = "numerical";
        }

        // Validar que la nota sea un número válido para notas numéricas
        if (formData.grade_type === "numerical") {
          const gradeNum = Number(formData.grade);
          if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 10) {
            toast.error("La nota debe ser un número entre 1 y 10");
            setIsLoading(false);
            return;
          }
        }

        // Validar que la nota sea un número válido para notas porcentuales
        if (formData.grade_type === "percentage") {
          const gradeNum = Number(formData.grade);
          if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            toast.error("El porcentaje debe ser un número entre 0 y 100");
            setIsLoading(false);
            return;
          }
        }

        // Para notas conceptuales, validar que sea un concepto válido
        if (formData.grade_type === "conceptual") {
          if (!formData.grade) {
            toast.error("La nota conceptual no puede estar vacía");
            setIsLoading(false);
            return;
          }

          const validConceptualGrades = [
            "excelente",
            "muy bueno",
            "bueno",
            "satisfactorio",
            "regular",
            "insuficiente",
          ];
          const inputGrade = formData.grade.toLowerCase().trim();
          if (!validConceptualGrades.includes(inputGrade)) {
            toast.error(
              "La nota conceptual debe ser: Excelente, Muy Bueno, Bueno, Satisfactorio, Regular o Insuficiente"
            );
            setIsLoading(false);
            return;
          }
        }

        // Para notas conceptuales, usar un valor numérico que represente el concepto
        let gradeValue: number;
        if (formData.grade_type === "conceptual") {
          // Mapear conceptos a valores numéricos para el backend
          const conceptualGrade = formData.grade.toLowerCase();
          switch (conceptualGrade) {
            case "excelente":
              gradeValue = 10;
              break;
            case "muy bueno":
              gradeValue = 9;
              break;
            case "bueno":
              gradeValue = 8;
              break;
            case "satisfactorio":
              gradeValue = 7;
              break;
            case "regular":
              gradeValue = 6;
              break;
            case "insuficiente":
              gradeValue = 4;
              break;
            default:
              // Si no es un concepto reconocido, usar 0 como valor por defecto
              gradeValue = 0;
          }
        } else {
          gradeValue = Number(formData.grade);
        }

        payload = {
          subject: Number(formData.subject),
          assessment_id: formData.assessment_id
            ? Number(formData.assessment_id)
            : null,
          student_id: Number(formData.student_id),
          grade_type: gradeType,
          description: formData.description,
          grade: gradeValue,
        };

        url = `/api/proxy/grades`;
        console.log("Payload enviado:", payload);
        console.log("Payload JSON:", JSON.stringify(payload, null, 2));
        console.log("URL:", url);
        console.log("Headers:", {
          "Content-Type": "application/json",
          withCredentials: true,
        });
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
        url = `/api/proxy/subject-messages`;
      } else {
        throw new Error("Tipo de formulario no válido");
      }

      const response = await axios.post(`${baseURL}${url}`, payload, {
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
      console.error("Error completo:", error);
      if (error instanceof Error) {
        console.error("Error de Axios:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        // Manejar errores específicos
        if (error.response?.status === 401) {
          toast.error("No tienes autorización para realizar esta acción");
        } else if (error.response?.status === 409) {
          toast.error(
            "Ya existe una calificación para este assessment y estudiante"
          );
        } else {
          toast.error(
            `Error ${error.response?.status}: ${
              error.response?.data || error.message
            }`
          );
        }
      } else {
        toast.error("Error en la creación");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función modular para obtener el label legible de un curso
  function getCourseLabel(course: {
    year: number;
    division: string;
    shift: string;
  }) {
    let yearLabel = "";
    let divisionLabel = "";
    if (course.year >= 8) {
      yearLabel = `${course.year - 7}° secundaria`;
      // Secundaria: 1=a, 2=b, 3=c
      if (course.division === "1") divisionLabel = "a";
      else if (course.division === "2") divisionLabel = "b";
      else if (course.division === "3") divisionLabel = "c";
      else divisionLabel = course.division;
    } else {
      yearLabel = `${course.year}° primaria`;
      // Primaria: 1=Mar, 2=Gaviota, 3=Estrella
      if (course.division === "1") divisionLabel = "Mar";
      else if (course.division === "2") divisionLabel = "Gaviota";
      else if (course.division === "3") divisionLabel = "Estrella";
      else divisionLabel = course.division;
    }
    return `${yearLabel} ${divisionLabel}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{action}</h2>
        {/* <ThemeToggle /> */}
      </div>

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
          <div className="mb-2 font-medium">Selecciona uno o más cursos:</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {formData.courses.length === 0
                  ? "Selecciona cursos"
                  : formData.courses.length > 3
                  ? `${formData.courses.length} cursos seleccionados`
                  : courses
                      .filter((c) => formData.courses.includes(c.id))
                      .map(getCourseLabel)
                      .join(", ")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-64 overflow-y-auto p-2">
              <div className="flex flex-col gap-2 mb-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    const allIds = courses.map((c) => c.id);
                    handleChange<MessageForm>("courses", allIds);
                  }}
                >
                  Agregar todos
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const primariaIds = courses
                        .filter((c) => c.year < 8)
                        .map((c) => c.id);
                      handleChange<MessageForm>("courses", primariaIds);
                    }}
                  >
                    Agregar primaria
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const secundariaIds = courses
                        .filter((c) => c.year >= 8)
                        .map((c) => c.id);
                      handleChange<MessageForm>("courses", secundariaIds);
                    }}
                  >
                    Agregar secundaria
                  </Button>
                </div>
              </div>
              {isLoadingCourses ? (
                <div className="text-muted-foreground">Cargando cursos...</div>
              ) : (
                courses.map((course) => {
                  const idNum = course.id;
                  return (
                    <DropdownMenuCheckboxItem
                      key={course.id}
                      checked={formData.courses.includes(idNum)}
                      onCheckedChange={(checked) => {
                        let newCourses = Array.isArray(formData.courses)
                          ? [...formData.courses]
                          : [];
                        if (checked) {
                          if (!newCourses.includes(idNum))
                            newCourses.push(idNum);
                        } else {
                          newCourses = newCourses.filter((c) => c !== idNum);
                        }
                        handleChange<MessageForm>("courses", newCourses);
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {getCourseLabel(course)}
                    </DropdownMenuCheckboxItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* Formulario para exámenes */}
      {action === "Crear examen" && isExamForm(formData) && (
        <>
          <Select
            value={formData.subject}
            onValueChange={(value) => handleChange<ExamForm>("subject", value)}
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
                  {"course_name" in subject ? ` - ${subject.course_name}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onValueChange={(
              value:
                | "exam"
                | "homework"
                | "project"
                | "oral"
                | "remedial"
                | "selfassessable"
            ) => handleChange<ExamForm>("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de evaluación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exam">Examen</SelectItem>
              <SelectItem value="homework">Tarea</SelectItem>
              <SelectItem value="project">Proyecto</SelectItem>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="remedial">Recuperatorio</SelectItem>
              <SelectItem value="selfassessable">
                Autoevaluable (quiz)
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Campos adicionales para exámenes autoevaluables */}
          {isSelfAssessableExamForm(formData) && (
            <div className="space-y-6 mt-4">
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Configuración del Quiz - Pregunta {currentQuestion + 1} de
                    10
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Preguntas completas: {getCompletedQuestionsCount()}/3 mínimo
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
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
                      <label className="block text-sm font-medium text-foreground mb-1">
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
                      <label className="block text-sm font-medium text-foreground mb-1">
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
                      <label className="block text-sm font-medium text-foreground mb-1">
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
                    disabled={currentQuestion === 9}
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
                          isQuestionComplete(index)
                            ? "bg-green-100 dark:bg-green-900"
                            : ""
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
              <Label htmlFor="assessment_id">Evaluación</Label>
              <Select
                value={formData.assessment_id}
                onValueChange={(value) =>
                  handleChange<GradeForm>("assessment_id", value)
                }
                disabled={isLoadingAssessments || !formData.subject}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.subject
                        ? "Primero selecciona una materia"
                        : isLoadingAssessments
                        ? "Cargando evaluaciones..."
                        : "Selecciona una evaluación"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem
                      key={assessment.id}
                      value={assessment.id.toString()}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{assessment.task}</span>
                        <span className="text-sm text-muted-foreground">
                          Tipo: {assessment.type} | Fecha:{" "}
                          {new Date(assessment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="student_id">Estudiante</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) =>
                  handleChange<GradeForm>("student_id", value)
                }
                disabled={isLoadingStudents || !formData.subject}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.subject
                        ? "Primero selecciona una materia"
                        : isLoadingStudents
                        ? "Cargando estudiantes..."
                        : "Selecciona un estudiante"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      <div className="flex items-center gap-2">
                        {student.photo ? (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={student.photo} />
                            <AvatarFallback className="text-xs">
                              {student.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {student.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span>{student.full_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  onValueChange={(value: "message" | "file" | "link") =>
                    handleChange<SubjectMessageForm>("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de mensaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Mensaje</SelectItem>
                    <SelectItem value="file">Archivo</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
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
        <Button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (action === "Crear examen" &&
              isExamForm(formData) &&
              isSelfAssessableExamForm(formData) &&
              !canCreateSelfAssessable())
          }
        >
          {isLoading ? "Enviando..." : "Crear"}
        </Button>
      </div>
    </div>
  );
};

export default ActionForm;
