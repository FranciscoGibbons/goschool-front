export interface SelfAssessableQuestion {
  id: number;
  question: string;
  op1: string;
  op2: string;
  op3: string | null;
  op4?: string | null;
  op5?: string | null;
  correct: string;
}

export interface SelfAssessableResponse {
  id: number;
  selfassessable_id: number;
  answers: string;
  student_id: number;
  submitted_at?: string;
  score?: number;
  max_score?: number;
}

export interface SelfAssessableSubmission {
  assessment_id: number;
  answers: string[];
}

export interface SelfAssessableResult {
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  details: Array<{
    question_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }>;
}

export interface SelfAssessableStats {
  total_attempts: number;
  completed: number;
  pending: number;
  average_score: number;
  best_score: number;
}

// Estados de progreso para los autoevaluables
export type SelfAssessableStatus = "not_started" | "in_progress" | "completed" | "expired";

// Helper para determinar el estado de un autoevaluable
export function getSelfAssessableStatus(
  dueDate: string,
  isAnswered: boolean
): SelfAssessableStatus {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const [year, month, day] = dueDate.split("-").map(Number);
  const dueOnly = new Date(year, month - 1, day);
  
  if (isAnswered) {
    return "completed";
  }
  
  if (todayOnly > dueOnly) {
    return "expired";
  }
  
  if (todayOnly.getTime() === dueOnly.getTime()) {
    return "in_progress";
  }
  
  return "not_started";
}

// Helper para obtener colores según el estado
export function getStatusColor(status: SelfAssessableStatus): string {
  switch (status) {
    case "not_started":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "expired":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
}

// Helper para obtener texto del estado
export function getStatusText(status: SelfAssessableStatus): string {
  switch (status) {
    case "not_started":
      return "Por comenzar";
    case "in_progress":
      return "Disponible hoy";
    case "completed":
      return "Completado";
    case "expired":
      return "Vencido";
    default:
      return "Desconocido";
  }
}