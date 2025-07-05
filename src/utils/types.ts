// TIPOS CORREGIDOS
export interface BaseExam {
  id: number;
  subject_id: number;
  task: string;
  due_date: string;
  created_at: string;
  type: "oral" | "selfassessable";
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

export interface MessageForm {
  title: string;
  message: string;
  courses: string;
}

// Formulario base para examen (campos comunes)
export interface BaseExamForm {
  subject: string;
  task: string;
  due_date: string;
  type: "oral" | "selfassessable";
}

// Formulario para examen oral
export interface OralExamForm extends BaseExamForm {
  type: "oral";
}

// Formulario para examen autoevaluable
export interface SelfAssessableExamForm extends BaseExamForm {
  type: "selfassessable";
  questions: string[];
  correct: string[];
  incorrect1: string[];
  incorrect2: string[];
}

// Tipo unión para el formulario de examen
export type ExamForm = OralExamForm | SelfAssessableExamForm;

// Formulario para calificaciones
export interface GradeForm {
  subject: string;
  assessment_id: string;
  student_id: string;
  grade_type: "numerical" | "conceptual";
  description: string;
  grade: string;
}

// Formulario para mensajes de materia
export interface SubjectMessageForm {
  subject_id: string;
  title: string;
  content: string;
  type: "message" | "file";
  file?: File;
}

// FormsObj corregido con tipos más precisos
export interface FormsObj {
  "Crear mensaje": MessageForm;
  "Crear examen": ExamForm;
  "Cargar calificación": GradeForm;
  "Crear mensaje de materia": SubjectMessageForm;
}

export interface Messages {
  title: string;
  message: string;
  courses: string;
  id: number;
}

export interface UserInfo {
  full_name: string;
  phone_number: string;
  address: string;
  birth_date: string;
  role: string;
  photo?: string;
}

// Tipos para los payloads de la API
export interface MessagePayload {
  title: string;
  message: string;
  courses: string;
}

export interface TaskPayload {
  subject: number;
  task: string;
  due_date: string;
  type: "oral" | "selfassessable";
}

export interface SelfAssessablePayload {
  questions: string[];
  correct: string[];
  incorrect1: string[];
  incorrect2: string[];
}

export interface ExamPayload {
  newtask: TaskPayload;
  newselfassessable?: SelfAssessablePayload;
}

export interface GradePayload {
  subject: number;
  assessment_id: number;
  student_id: number;
  grade_type: "numerical" | "conceptual";
  description: string;
  grade: number | string;
}

export interface SubjectMessagePayload {
  subject_id: number;
  title: string;
  content: string;
  type: "message" | "file";
  file?: File;
}
