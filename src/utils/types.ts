export interface Exam {
  id: number;
  subject_id: number; // por ahora
  task: string;
  due_date: string;
  created_at: string;
  type: "exam" | "homework" | "project";
}

export type Role = "admin" | "teacher" | "student" | "preceptor" | "father";

interface MessageForm {
  title: string;
  message: string;
  courses: string;
}

export interface FormsObj {
  "Crear mensaje": MessageForm;
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
