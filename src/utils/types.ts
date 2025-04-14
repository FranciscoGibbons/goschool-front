export interface Exam {
    id: number;
    subject_id: number; // por ahora
    task: string;
    due_date: string;
    created_at: string;
    type: "exam" | "homework" | "project";
}