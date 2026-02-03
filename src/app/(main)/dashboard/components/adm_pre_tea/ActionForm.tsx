"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FormsObj,
  MessageForm,
  ExamForm,
  SelfAssessableExamForm,
  GradeForm,
  SubjectMessageForm,
  DisciplinarySanctionForm,
  AssistanceForm,
} from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cleanSubjectName } from "@/utils/subjectHelpers";
import axios from "axios";
import { fetchAllPages } from "@/utils/fetchAllPages";

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
import { SANCTION_TYPES, SANCTION_LABELS } from "@/types/disciplinarySanction";
import { PRESENCE_STATUS } from "@/types/assistance";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";

// Tipos para los datos dinámicos
interface Assessment {
  id: number;
  task: string;
  subject_id: number;
  due_date: string;
  type: string;
}

// Interfaces para el backend
interface PubUser {
  id: number;
  photo: string | null;
  course_id: number | null;
  full_name: string; // Ahora incluye full_name directamente
}

interface Student {
  id: number;
  full_name: string;
  photo?: string | null;
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
    } else if (action === "Crear conducta") {
      return {
        student_id: "",
        sanction_type: "",
        quantity: "1",
        description: "",
        date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
      } as DisciplinarySanctionForm;
    } else if (action === "Crear asistencia") {
      return {
        course_id: "",
        date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        students: [],
      } as AssistanceForm;
    } else {
      return { title: "", message: "", courses: [] } as MessageForm;
    }
  };

  const [formData, setFormData] = useState<FormsObj[typeof action]>(
    getInitialState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Hook para años académicos
  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();

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

  // Estado para el curso seleccionado en formulario de conducta
  const [selectedCourseIdConducta, setSelectedCourseIdConducta] = useState<string>("");

  // Estado para el curso seleccionado en formulario de asistencia  
  const [selectedCourseIdAsistencia, setSelectedCourseIdAsistencia] = useState<string>("");

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

  const isDisciplinarySanctionForm = (
    data: FormsObj[typeof action]
  ): data is DisciplinarySanctionForm => {
    return action === "Crear conducta";
  };

  const isAssistanceForm = (
    data: FormsObj[typeof action]
  ): data is AssistanceForm => {
    return action === "Crear asistencia";
  };

  // Función para cargar materias con información de cursos
  const loadSubjectsWithCourses = useCallback(async (academicYearId?: number | null) => {
    try {
      setIsLoadingSubjects(true);

      console.log("Iniciando carga de materias y cursos...", { academicYearId });

      // Solo necesitamos cargar subjects ya que incluye course_name
      const params: Record<string, number> = {};
      if (academicYearId) {
        params.academic_year_id = academicYearId;
      }

      const subjectsProcessed = await fetchAllPages<{
        id: number;
        name: string;
        course_id: number;
        course_name?: string;
      }>('/api/proxy/subjects/', params);

      console.log("Subjects data procesado:", subjectsProcessed);

      // Las materias ya vienen con course_name desde el backend
      const subjectsWithCourses: SubjectWithCourseName[] = subjectsProcessed.map(
        (subject: { id: number; name: string; course_id: number; course_name?: string }) => ({
          ...subject,
          teacher_id: 0, // Valor dummy para cumplir con el tipo Subject
          course_name: subject.course_name || `Curso ${subject.course_id}`,
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
  }, [setIsLoadingSubjects, setSubjects]);

  // Función para cargar evaluaciones de una materia
  const loadAssessments = async (subjectId: string, academicYearId?: number | null) => {
    if (!subjectId) {
      setAssessments([]);
      return;
    }

    setIsLoadingAssessments(true);
    try {
      const params: Record<string, string | number> = {
        subject_id: subjectId
      };
      if (academicYearId) {
        params.academic_year_id = academicYearId;
      }

      const assessments = await fetchAllPages<Assessment>('/api/proxy/assessments/', params);

      console.log("Respuesta de evaluaciones:", assessments);
      setAssessments(assessments);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Error al cargar evaluaciones");
      setAssessments([]);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  // Función para cargar estudiantes de un curso
  const loadStudents = async (courseId: number, academicYearId?: number | null) => {
    if (!courseId) {
      setStudents([]);
      return;
    }

    setIsLoadingStudents(true);
    try {
      // Obtener estudiantes del backend (ahora incluye full_name)
      const params: Record<string, number | string> = {
        course: courseId,
        role: 'student'
      };
      if (academicYearId) {
        params.academic_year_id = academicYearId;
      }

      const pubUsers = await fetchAllPages<PubUser>('/api/proxy/students/', params);

      console.log("Students data from backend:", pubUsers);

      if (pubUsers.length === 0) {
        setStudents([]);
        return;
      }

      // Convertir PubUser a Student (ya no necesitamos llamadas adicionales)
      const studentsData: Student[] = pubUsers.map((pubUser: PubUser) => ({
        id: pubUser.id,
        full_name: pubUser.full_name || `Estudiante ${pubUser.id}`,
        photo: pubUser.photo,
      }));

      console.log("Final students data:", studentsData);
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
      const courses = await fetchAllPages<{
        id: number;
        name: string;
        year: number;
        division: string;
        shift: string;
      }>('/api/proxy/courses/');

      console.log("Cursos recibidos:", courses);
      setCourses(courses);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Error al cargar cursos");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Cargar materias cuando se necesite o cuando cambie el año académico
  useEffect(() => {
    if (
      action === "Cargar calificación" ||
      action === "Crear mensaje de materia" ||
      action === "Crear examen"
    ) {
      console.log("Cargando materias para action:", action, "año académico:", selectedYearId);
      loadSubjectsWithCourses(selectedYearId);
      // Reset subject selection when academic year changes
      setFormData(getInitialState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, selectedYearId]);

  // Cargar cursos cuando se necesite
  useEffect(() => {
    if (action === "Crear mensaje" || action === "Crear conducta" || action === "Crear asistencia") {
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
        loadAssessments(subject, selectedYearId);
        setFormData((prev) =>
          isGradeForm(prev) ? { ...prev, assessment_id: "" } : prev
        );
        prevSubjectAssessmentsRef.current = subject;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, action, selectedYearId]);

  // Effect to load students only when subject changes
  useEffect(() => {
    if (action === "Cargar calificación" && isGradeForm(formData)) {
      const subject = formData.subject;
      if (subject && subject !== prevSubjectStudentsRef.current) {
        const selectedSubject = subjects.find(
          (s) => s.id.toString() === subject
        );
        if (selectedSubject) {
          loadStudents(selectedSubject.course_id, selectedYearId);
          setFormData((prev) =>
            isGradeForm(prev) ? { ...prev, student_id: "" } : prev
          );
        }
        prevSubjectStudentsRef.current = subject;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, subjects, action, selectedYearId]);

  // Effect to load students for conducta form when course changes
  useEffect(() => {
    if (action === "Crear conducta" && selectedCourseIdConducta) {
      loadStudents(parseInt(selectedCourseIdConducta), selectedYearId);
      // Reset student selection when course changes
      if (isDisciplinarySanctionForm(formData)) {
        setFormData((prev) =>
          isDisciplinarySanctionForm(prev) ? { ...prev, student_id: "" } : prev
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseIdConducta, action, selectedYearId]);

  // Effect to load students for assistance form when course changes
  useEffect(() => {
    if (action === "Crear asistencia" && selectedCourseIdAsistencia) {
      loadStudents(parseInt(selectedCourseIdAsistencia), selectedYearId);
      // Reset students array when course changes
      if (isAssistanceForm(formData)) {
        setFormData((prev) =>
          isAssistanceForm(prev) ? { ...prev, course_id: selectedCourseIdAsistencia, students: [] } : prev
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseIdAsistencia, action, selectedYearId]);

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

  // Función para actualizar la asistencia de un estudiante específico
  const handleStudentPresenceChange = (studentId: number, presence: string) => {
    if (isAssistanceForm(formData)) {
      const updatedStudents = [...formData.students];
      const existingIndex = updatedStudents.findIndex(s => s.student_id === studentId);
      
      if (existingIndex >= 0) {
        updatedStudents[existingIndex] = { student_id: studentId, presence };
      } else {
        updatedStudents.push({ student_id: studentId, presence });
      }
      
      setFormData({
        ...formData,
        students: updatedStudents,
      } as AssistanceForm);
    }
  };

  // Función para inicializar asistencia con todos los estudiantes como presentes
  const initializeAllStudentsAsPresent = () => {
    if (isAssistanceForm(formData)) {
      const initialStudents = students.map(student => ({
        student_id: student.id,
        presence: PRESENCE_STATUS.PRESENT,
      }));
      
      setFormData({
        ...formData,
        students: initialStudents,
      } as AssistanceForm);
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
        } else if (formData.file && formData.type === "homework") {
          // Homework with file attachment: use multipart upload
          const formDataToSend = new FormData();
          formDataToSend.append("subject", String(Number(formData.subject)));
          formDataToSend.append("task", formData.task);
          formDataToSend.append("due_date", formData.due_date);
          formDataToSend.append("type", formData.type);
          formDataToSend.append("file", formData.file);

          payload = formDataToSend;
          url = `/api/proxy/assessments/upload`;
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
          console.log("🔍 Validando nota conceptual:", formData.grade);
          if (!formData.grade) {
            toast.error("La nota conceptual no puede estar vacía");
            setIsLoading(false);
            return;
          }

          const validConceptualGrades = [
            "e",
            "mb", 
            "b",
            "s",
            "r",
            "i",
          ];
          const inputGrade = formData.grade.toLowerCase().trim();
          console.log("✅ Nota conceptual a validar:", inputGrade);
          console.log("🔍 Notas válidas:", validConceptualGrades);
          if (!validConceptualGrades.includes(inputGrade)) {
            toast.error(
              "La nota conceptual debe ser: E, MB, B, S, R o I"
            );
            setIsLoading(false);
            return;
          }
          console.log("✅ Nota conceptual válida");
        }

        // Para notas conceptuales, usar un valor numérico que represente el concepto
        let gradeValue: number;
        if (formData.grade_type === "conceptual") {
          console.log("🔄 Convirtiendo nota conceptual a numérica:", formData.grade);
          // Mapear conceptos a valores numéricos para el backend
          const conceptualGrade = formData.grade.toLowerCase();
          switch (conceptualGrade) {
            case "e":
              gradeValue = 10;
              break;
            case "mb":
              gradeValue = 9;
              break;
            case "b":
              gradeValue = 8;
              break;
            case "s":
              gradeValue = 7;
              break;
            case "r":
              gradeValue = 6;
              break;
            case "i":
              gradeValue = 4;
              break;
            default:
              // Si no es un concepto reconocido, usar 0 como valor por defecto
              gradeValue = 0;
          }
          console.log("🔄 Valor numérico asignado:", gradeValue);
        } else {
          gradeValue = Number(formData.grade);
          console.log("🔄 Valor numérico directo:", gradeValue);
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
      } else if (action === "Crear conducta" && isDisciplinarySanctionForm(formData)) {
        // Validar que todos los campos requeridos estén presentes
        if (
          !formData.student_id ||
          !formData.sanction_type ||
          !formData.quantity ||
          !formData.description ||
          !formData.date
        ) {
          toast.error("Por favor completa todos los campos requeridos");
          setIsLoading(false);
          return;
        }

        // Validar que la cantidad sea un número positivo
        const quantity = parseInt(formData.quantity);
        if (isNaN(quantity) || quantity < 1) {
          toast.error("La cantidad debe ser un número positivo");
          setIsLoading(false);
          return;
        }

        // Validar que la descripción tenga al menos 10 caracteres
        if (formData.description.trim().length < 10) {
          toast.error("La descripción debe tener al menos 10 caracteres");
          setIsLoading(false);
          return;
        }

        payload = {
          student_id: Number(formData.student_id),
          sanction_type: formData.sanction_type,
          quantity: quantity,
          description: formData.description.trim(),
          date: formData.date,
        };

        url = `/api/proxy/disciplinary_sanction`;
      } else if (action === "Crear asistencia" && isAssistanceForm(formData)) {
        // Validar que todos los campos requeridos estén presentes
        if (!formData.course_id || !formData.date || formData.students.length === 0) {
          toast.error("Por favor selecciona un curso, fecha y registra al menos un estudiante");
          setIsLoading(false);
          return;
        }

        // Validar que todos los estudiantes tengan un estado de presencia
        const invalidStudents = formData.students.filter(s => !s.presence);
        if (invalidStudents.length > 0) {
          toast.error("Todos los estudiantes deben tener un estado de asistencia");
          setIsLoading(false);
          return;
        }

        // Crear asistencias para cada estudiante
        const assistancePromises = formData.students.map(async (student) => {
          const assistanceData = {
            student_id: student.student_id,
            presence: student.presence,
            date: formData.date,
          };

          console.log('📝 Creating assistance for student:', assistanceData);

          const response = await fetch("/api/proxy/assistance", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assistanceData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${response.status} para estudiante ${student.student_id}`);
          }

          return response.json();
        });

        try {
          await Promise.all(assistancePromises);
          toast.success(`Asistencia registrada para ${formData.students.length} estudiantes`);
          onClose();
          setIsLoading(false);
          return;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Error al crear asistencias";
          console.error("❌ Error creating assistances:", err);
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }
      } else {
        throw new Error("Tipo de formulario no válido");
      }

      // Configuración de la solicitud
      const isFormData = payload instanceof FormData;
      let requestBody: BodyInit;
      
      if (isFormData) {
        requestBody = payload as FormData;
      } else {
        requestBody = JSON.stringify(payload as Record<string, unknown> | string | number | boolean | null);
      }
      
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(!isFormData && { 'Content-Type': 'application/json' }),
        },
        credentials: 'include',
        body: requestBody,
      };

      console.log('Enviando solicitud a:', url);
      console.log('Método:', requestOptions.method);
      console.log('Headers:', requestOptions.headers);
      console.log('Payload:', payload);
      
      // Enviar la solicitud
      const response = await fetch(url, requestOptions);
      
      // Procesar la respuesta
      const contentType = response.headers.get('content-type');
      let responseData;
      
      try {
        responseData = contentType?.includes('application/json')
          ? await response.json()
          : await response.text();
          
        console.log('Respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });
      } catch (error) {
        console.error('Error al analizar la respuesta:', error);
        throw new Error('Error al procesar la respuesta del servidor');
      }
      
      if (!response.ok) {
        let errorMessage = 'Error en la solicitud';
        
        if (typeof responseData === 'object' && responseData !== null) {
          errorMessage = responseData.error || responseData.message || JSON.stringify(responseData);
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
        
        console.error('Error en la respuesta:', {
          status: response.status,
          message: errorMessage,
        });
        
        throw new Error(errorMessage);
      }

      if (response.status === 201 || response.status === 200) {
        const successMessage =
          action === "Cargar calificación"
            ? "Calificación cargada exitosamente"
            : action === "Crear mensaje de materia"
            ? "Mensaje de materia creado exitosamente"
            : action === "Crear conducta"
            ? "Sanción disciplinaria creada exitosamente"
            // : action === "Crear asistencia" // Nunca se ejecuta, ya retornamos antes
            // ? "Asistencias registradas exitosamente"
            : "Examen creado exitosamente";
        toast.success(successMessage);
        onClose();
      } else {
        toast.error("Error en la creación");
      }
    } catch (err) {
      console.error("Error completo:", err);
      const error = err as {
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
          headers?: Record<string, string>;
        };
        message?: string;
      };
      
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
        const errorMessage = error.response?.data 
          ? typeof error.response.data === 'object' 
            ? JSON.stringify(error.response.data)
            : String(error.response.data)
          : error.message || 'Error desconocido';
            
        toast.error(
          `Error ${error.response?.status || ''}: ${errorMessage}`.trim()
        );
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

      {/* Selector de año académico */}
      {academicYears.length > 1 && (
        <div className="pb-2 border-b">
          <Label className="text-sm text-muted-foreground mb-2 block">Ciclo lectivo</Label>
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
            disabled={isLoadingYears || isLoading}
          />
        </div>
      )}

      {/* Formulario para mensajes */}
      {action === "Crear mensaje" && isMessageForm(formData) && (
        <>
          <Input
            placeholder="Título"
            value={formData.title}
            onChange={(e) => handleChange<MessageForm>("title", e.target.value)}
          />
          <Textarea
            placeholder="Mensaje"
            value={formData.message}
            onChange={(e) =>
              handleChange<MessageForm>("message", e.target.value)
            }
            className="min-h-[120px]"
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
                  {cleanSubjectName(subject.name)}
                  {subject.course_name && ` - ${subject.course_name}`}
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

          {/* File attachment for homework type */}
          {formData.type === "homework" && (
            <div>
              <Label htmlFor="homework_file">Archivo adjunto (opcional)</Label>
              <Input
                id="homework_file"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      file,
                    } as ExamForm);
                  } else {
                    const { ...rest } = formData;
                    setFormData({ ...rest, file: undefined } as ExamForm);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos permitidos: PDF, DOCX (max. 10MB)
              </p>
            </div>
          )}

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
                            ? "bg-success-muted"
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
                      {cleanSubjectName(subject.name)}
                      {subject.course_name && ` - ${subject.course_name}`}
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
              {formData.grade_type === "conceptual" ? (
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    handleChange<GradeForm>("grade", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nota (E, MB, B, S, R, I)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e">E (Excelente)</SelectItem>
                    <SelectItem value="mb">MB (Muy Bueno)</SelectItem>
                    <SelectItem value="b">B (Bueno)</SelectItem>
                    <SelectItem value="s">S (Satisfactorio)</SelectItem>
                    <SelectItem value="r">R (Regular)</SelectItem>
                    <SelectItem value="i">I (Insuficiente)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="grade"
                  placeholder="7.5"
                  value={formData.grade}
                  onChange={(e) =>
                    handleChange<GradeForm>("grade", e.target.value)
                  }
                />
              )}
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
                        {cleanSubjectName(subject.name)}
                        {subject.course_name && ` - ${subject.course_name}`}
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
                    accept=".pdf,.docx"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos permitidos: PDF, DOCX (max. 10MB)
                  </p>
                </div>
              )}
            </div>
          </>
        )}

      {/* Formulario para conducta/sanción disciplinaria */}
      {action === "Crear conducta" && isDisciplinarySanctionForm(formData) && (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course_select">Curso</Label>
              <Select
                value={selectedCourseIdConducta}
                onValueChange={setSelectedCourseIdConducta}
                disabled={isLoadingCourses}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCourses
                        ? "Cargando cursos..."
                        : "Selecciona un curso"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {getCourseLabel(course)}
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
                  handleChange<DisciplinarySanctionForm>("student_id", value)
                }
                disabled={isLoadingStudents || !selectedCourseIdConducta}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedCourseIdConducta
                        ? "Primero selecciona un curso"
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
              <Label htmlFor="sanction_type">Tipo de Sanción</Label>
              <Select
                value={formData.sanction_type}
                onValueChange={(value) =>
                  handleChange<DisciplinarySanctionForm>("sanction_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de sanción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SANCTION_TYPES.ADMONITION}>
                    {SANCTION_LABELS[SANCTION_TYPES.ADMONITION]}
                  </SelectItem>
                  <SelectItem value={SANCTION_TYPES.WARNING}>
                    {SANCTION_LABELS[SANCTION_TYPES.WARNING]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) =>
                  handleChange<DisciplinarySanctionForm>("quantity", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  handleChange<DisciplinarySanctionForm>("date", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe la situación que motivó la sanción disciplinaria... (mínimo 10 caracteres)"
                value={formData.description}
                onChange={(e) =>
                  handleChange<DisciplinarySanctionForm>("description", e.target.value)
                }
                className="min-h-[100px]"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mínimo 10 caracteres</span>
                <span>{formData.description.length}/500</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Formulario para asistencia */}
      {action === "Crear asistencia" && isAssistanceForm(formData) && (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course_select_assistance">Curso</Label>
              <Select
                value={selectedCourseIdAsistencia}
                onValueChange={setSelectedCourseIdAsistencia}
                disabled={isLoadingCourses}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCourses
                        ? "Cargando cursos..."
                        : "Selecciona un curso"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {getCourseLabel(course)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assistance_date">Fecha</Label>
              <Input
                id="assistance_date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  handleChange<AssistanceForm>("date", e.target.value)
                }
              />
            </div>

            {selectedCourseIdAsistencia && students.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Asistencia de Estudiantes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={initializeAllStudentsAsPresent}
                  >
                    Marcar todos como presentes
                  </Button>
                </div>
                
                <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                  {students.map((student) => {
                    const currentPresence = formData.students.find(
                      s => s.student_id === student.id
                    )?.presence || "";
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-3">
                          {student.photo ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo} />
                              <AvatarFallback className="text-xs">
                                {student.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="font-medium">{student.full_name}</span>
                        </div>
                        
                        <Select
                          value={currentPresence}
                          onValueChange={(value) =>
                            handleStudentPresenceChange(student.id, value)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PRESENCE_STATUS.PRESENT}>
                              ✅ Presente
                            </SelectItem>
                            <SelectItem value={PRESENCE_STATUS.ABSENT}>
                              ❌ Ausente
                            </SelectItem>
                            <SelectItem value={PRESENCE_STATUS.LATE}>
                              ⏰ Tarde
                            </SelectItem>
                            <SelectItem value={PRESENCE_STATUS.JUSTIFIED}>
                              📋 Justificado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formData.students.length} de {students.length} estudiantes con asistencia registrada
                </div>
              </div>
            )}

            {selectedCourseIdAsistencia && isLoadingStudents && (
              <div className="text-center py-4">
                <div className="text-muted-foreground">Cargando estudiantes...</div>
              </div>
            )}

            {selectedCourseIdAsistencia && !isLoadingStudents && students.length === 0 && (
              <div className="text-center py-4">
                <div className="text-muted-foreground">No se encontraron estudiantes en este curso</div>
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
