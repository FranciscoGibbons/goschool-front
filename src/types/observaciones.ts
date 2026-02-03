export interface ObservacionWithNames {
  id: number;
  sender_id: number;
  sender_name: string;
  student_id: number;
  student_name: string;
  title: string;
  body: string;
  parent_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface NewObservacion {
  student_id: number;
  title: string;
  body: string;
}

export interface ReplyObservacion {
  parent_reply: string;
}

export interface ObservacionFilter {
  observacion_id?: number;
  student_id?: number;
  sender_id?: number;
}
