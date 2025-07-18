// TIPOS CORREGIDOS
export interface BaseExam {
  id: number;
  subject_id: number;
  task: string;
  due_date: string;
  created_at: string;
  type:
    | "exam"
    | "homework"
    | "project"
    | "oral"
    | "remedial"
    | "selfassessable";
  questions?: string[];
}

export interface SelfAssessableExam extends BaseExam {
  type: "selfassessable";
  questions: string[];
  correct: string[];
  incorrect1: string[];
  incorrect2: string[];
}

export type Exam = BaseExam | SelfAssessableExam;

export type Role = "admin" | "teacher" | "student" | "preceptor" | "father";

// Formulario base para examen (campos comunes)
export interface BaseExamForm {
  subject: string;
  task: string;
  due_date: string;
  type:
    | "exam"
    | "homework"
    | "project"
    | "oral"
    | "remedial"
    | "selfassessable";
}

// Formulario para examen autoevaluable
export interface SelfAssessableExamForm extends BaseExamForm {
  type: "selfassessable";
  questions: string[];
  correct: string[];
  incorrect1: string[];
  incorrect2: string[];
}

export type ExamForm = BaseExamForm | SelfAssessableExamForm;

// Tipos para mensajes
export interface MessageForm {
  title: string;
  message: string;
  courses: number[];
}

// Tipos para calificaciones
export interface GradeForm {
  subject: string;
  assessment_id: string;
  student_id: string;
  grade_type: "numerical" | "conceptual" | "percentage";
  description: string;
  grade: string;
}

// Tipos para mensajes de materia
export interface SubjectMessageForm {
  subject_id: string;
  title: string;
  content: string;
  type: "message" | "file";
  file?: File;
}

// Union type para todos los formularios
export interface FormsObj {
  "Crear mensaje": MessageForm;
  "Crear examen": ExamForm;
  "Cargar calificación": GradeForm;
  "Crear mensaje de materia": SubjectMessageForm;
}

// Type guards
export function isMessageForm(form: any): form is MessageForm {
  return "title" in form && "message" in form && "courses" in form;
}

export function isExamForm(form: any): form is ExamForm {
  return (
    "subject" in form && "task" in form && "due_date" in form && "type" in form
  );
}

export function isGradeForm(form: any): form is GradeForm {
  return "subject" in form && "grade_type" in form && "grade" in form;
}

export function isSubjectMessageForm(form: any): form is SubjectMessageForm {
  return "subject_id" in form && "title" in form && "content" in form;
}

// Re-exportar funciones de utilidad desde examUtils
export {
  translateExamType,
  getExamTypeColor,
  getExamTypeIndicatorColor,
  getExamTypeDescription,
  EXAM_TYPES,
  type ExamType,
} from "./examUtils";
