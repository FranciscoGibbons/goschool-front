// TIPOS CORREGIDOS Y SEGUROS
export interface BaseExam {
  readonly id: number;
  readonly subject_id: number;
  readonly task: string;
  readonly due_date: string;
  readonly created_at: string;
  readonly type:
    | "exam"
    | "homework" 
    | "project"
    | "oral"
    | "remedial"
    | "selfassessable";
  readonly questions?: readonly string[];
}

export interface SelfAssessableExam extends BaseExam {
  readonly type: "selfassessable";
  readonly questions: readonly string[];
  readonly correct: readonly string[];
  readonly incorrect1: readonly string[];
  readonly incorrect2: readonly string[];
}

export type Exam = BaseExam | SelfAssessableExam;

export type Role = "admin" | "teacher" | "student" | "preceptor" | "father";

// Interfaz para hijos del padre (readonly para inmutabilidad)
export interface Child {
  readonly id: number;
  readonly name: string;
  readonly last_name: string;
  readonly course_id: number;
  readonly course_name?: string;
}

// Interfaz para información del usuario (más estricta)
export interface UserInfo {
  readonly id: number;
  readonly name: string;
  readonly last_name: string;
  readonly full_name?: string; // Para compatibilidad con APIs que devuelven full_name
  readonly email: string;
  readonly role: Role;
  readonly photo?: string | null;
  readonly children?: readonly Child[]; // Solo para padres
  readonly course_id?: number; // Solo para estudiantes
}

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

// Tipos para mensajes con validación
export interface MessageForm {
  title: string;
  message: string;
  courses: number[];
}

// Tipos para calificaciones con validación estricta
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
  type: "message" | "file" | "link";
  file?: File;
}

// Union type para todos los formularios
export interface FormsObj {
  "Crear mensaje": MessageForm;
  "Crear examen": ExamForm;
  "Cargar calificación": GradeForm;
  "Crear mensaje de materia": SubjectMessageForm;
}

// Type guards mejorados con validación
export function isMessageForm(form: unknown): form is MessageForm {
  if (typeof form !== "object" || form === null) return false;
  
  const f = form as Record<string, unknown>;
  return (
    typeof f.title === "string" &&
    typeof f.message === "string" &&
    Array.isArray(f.courses) &&
    f.courses.every((c): c is number => typeof c === "number")
  );
}

export function isExamForm(form: unknown): form is ExamForm {
  if (typeof form !== "object" || form === null) return false;
  
  const f = form as Record<string, unknown>;
  const validTypes = ["exam", "homework", "project", "oral", "remedial", "selfassessable"];
  
  return (
    typeof f.subject === "string" &&
    typeof f.task === "string" &&
    typeof f.due_date === "string" &&
    typeof f.type === "string" &&
    validTypes.includes(f.type)
  );
}

export function isGradeForm(form: unknown): form is GradeForm {
  if (typeof form !== "object" || form === null) return false;
  
  const f = form as Record<string, unknown>;
  const validGradeTypes = ["numerical", "conceptual", "percentage"];
  
  return (
    typeof f.subject === "string" &&
    typeof f.grade_type === "string" &&
    typeof f.grade === "string" &&
    validGradeTypes.includes(f.grade_type)
  );
}

export function isSubjectMessageForm(form: unknown): form is SubjectMessageForm {
  if (typeof form !== "object" || form === null) return false;
  
  const f = form as Record<string, unknown>;
  const validTypes = ["message", "file", "link"];
  
  return (
    typeof f.subject_id === "string" &&
    typeof f.title === "string" &&
    typeof f.content === "string" &&
    typeof f.type === "string" &&
    validTypes.includes(f.type)
  );
}

// Tipos para respuestas de API más estrictos
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly error?: string;
}

export interface Course {
  readonly id: number;
  readonly course_name: string;
  readonly year: number;
}

export interface Subject {
  readonly id: number;
  readonly subject_name: string;
  readonly course_id: number;
  readonly course_name?: string;
}

export interface Grade {
  readonly id: number;
  readonly student_id: number;
  readonly subject_id: number;
  readonly assessment_id: number;
  readonly grade: string;
  readonly grade_type: "numerical" | "conceptual" | "percentage";
  readonly description: string;
  readonly created_at: string;
}

export interface Message {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly sender_id: number;
  readonly sender_name: string;
  readonly created_at: string;
  readonly type: "message" | "file" | "link";
}

export interface Timetable {
  readonly id: number;
  readonly course_id: number;
  readonly subject_id: number;
  readonly subject_name: string;
  readonly day: number;
  readonly start_time: string;
  readonly end_time: string;
  readonly teacher_name?: string;
}

// Utility types para mayor seguridad de tipos
export type NonEmptyArray<T> = [T, ...T[]];
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

// Branded types para mayor seguridad
export type UserId = number & { readonly __brand: 'UserId' };
export type CourseId = number & { readonly __brand: 'CourseId' };
export type SubjectId = number & { readonly __brand: 'SubjectId' };
export type AssessmentId = number & { readonly __brand: 'AssessmentId' };

// Funciones de validación de IDs
export function isValidUserId(id: number): id is UserId {
  return Number.isInteger(id) && id > 0;
}

export function isValidCourseId(id: number): id is CourseId {
  return Number.isInteger(id) && id > 0;
}

export function isValidSubjectId(id: number): id is SubjectId {
  return Number.isInteger(id) && id > 0;
}

export function isValidAssessmentId(id: number): id is AssessmentId {
  return Number.isInteger(id) && id > 0;
}

// Helper para crear IDs seguros
export function createUserId(id: number): UserId | null {
  return isValidUserId(id) ? id : null;
}

export function createCourseId(id: number): CourseId | null {
  return isValidCourseId(id) ? id : null;
}

export function createSubjectId(id: number): SubjectId | null {
  return isValidSubjectId(id) ? id : null;
}

export function createAssessmentId(id: number): AssessmentId | null {
  return isValidAssessmentId(id) ? id : null;
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
