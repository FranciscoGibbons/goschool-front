// ============================================================================
// CIRCULARES
// ============================================================================

export interface Circular {
  id: number;
  sender_id: number;
  title: string;
  body: string;
  target_roles: string | null;
  requires_confirmation: boolean;
  created_at: string;
}

export interface CircularAttachment {
  id: number;
  circular_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface CircularWithStats {
  id: number;
  sender_id: number;
  sender_name: string | null;
  title: string;
  body: string;
  target_roles: string | null;
  requires_confirmation: boolean;
  created_at: string;
  courses: number[];
  attachments: CircularAttachment[];
  total_targets: number;
  total_confirmed: number;
  is_confirmed_by_me: boolean;
}

export interface NewCircular {
  title: string;
  body: string;
  courses: number[];
  target_roles?: string | null;
  requires_confirmation?: boolean;
}

export interface UpdateCircular {
  title?: string;
  body?: string;
  target_roles?: string | null;
  requires_confirmation?: boolean;
}

export interface CircularConfirmationWithName {
  user_id: number;
  full_name: string;
  confirmed_at: string;
}

export interface PendingConfirmation {
  user_id: number;
  full_name: string;
  email: string;
}

export interface ConfirmationDashboard {
  total_targets: number;
  total_confirmed: number;
  confirmed: CircularConfirmationWithName[];
  pending: PendingConfirmation[];
}

export interface CircularFilter {
  course_id?: number;
}

// ============================================================================
// AUTORIZACIONES
// ============================================================================

export interface Autorizacion {
  id: number;
  sender_id: number;
  title: string;
  description: string;
  deadline: string | null;
  created_at: string;
}

export interface AutorizacionWithStats {
  id: number;
  sender_id: number;
  sender_name: string | null;
  title: string;
  description: string;
  deadline: string | null;
  created_at: string;
  courses: number[];
  total_expected: number;
  total_accepted: number;
  total_rejected: number;
  total_pending: number;
  my_response: string | null;
}

export interface NewAutorizacion {
  title: string;
  description: string;
  courses: number[];
  deadline?: string | null;
}

export interface UpdateAutorizacion {
  title?: string;
  description?: string;
  deadline?: string | null;
}

export interface NewAutorizacionResponse {
  autorizacion_id: number;
  student_id: number;
  status: "accepted" | "rejected";
  observations?: string;
}

export interface AutorizacionResponseWithNames {
  id: number;
  parent_name: string;
  student_name: string;
  status: string;
  observations: string | null;
  responded_at: string | null;
}

export interface AutorizacionFilter {
  course_id?: number;
}

// ============================================================================
// NOTAS INDIVIDUALES
// ============================================================================

export interface NotaIndividualWithNames {
  id: number;
  sender_id: number;
  sender_name: string;
  student_id: number;
  student_name: string;
  subject: string;
  body: string;
  parent_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface NewNotaIndividual {
  student_id: number;
  subject: string;
  body: string;
}

export interface ReplyNotaIndividual {
  parent_reply: string;
}

export interface NotaIndividualFilter {
  student_id?: number;
}
