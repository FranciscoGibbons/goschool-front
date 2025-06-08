// TIPOS

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

export interface FormsObj {
  "Crear mensaje": MessageForm;
  "Crear examen": {
    subject: string;
    task: string;
    due_date: string;
    type: "oral" | "selfassessable";
    questions: string[];
    correct: string[];
    incorrect1: string[];
    incorrect2: string[];
  };
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
}
