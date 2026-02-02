export interface Assistance {
  id: number;
  student_id: number;
  presence: string;
  date: string;
}

export interface NewAssistance {
  student_id: number;
  presence: string;
  date: string;
}

export interface UpdateAssistance {
  student_id: number;
  presence: string;
  date: string;
}

export interface AssistanceFilter {
  assistance_id?: number;
  student_id?: number;
  presence?: string;
  date?: string;
  academic_year_id?: number;
}

// Valores posibles para el campo presence
export const PRESENCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  JUSTIFIED: "excused"
} as const;

export type PresenceStatus = typeof PRESENCE_STATUS[keyof typeof PRESENCE_STATUS];