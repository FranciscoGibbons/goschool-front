// ============================================================================
// TEACHER AVAILABILITY
// ============================================================================

export interface TeacherAvailability {
  id: number;
  teacher_id: number;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  location: string | null;
  is_virtual: boolean;
  meeting_link: string | null;
  created_at: string;
}

export interface NewTeacherAvailability {
  date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes?: number;
  location?: string;
  is_virtual?: boolean;
  meeting_link?: string;
}

export interface UpdateTeacherAvailability {
  date?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  location?: string;
  is_virtual?: boolean;
  meeting_link?: string;
}

// ============================================================================
// BLOCKED SLOTS
// ============================================================================

export interface TeacherBlockedSlot {
  id: number;
  teacher_id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export interface NewTeacherBlockedSlot {
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

// ============================================================================
// AVAILABLE SLOTS (computed)
// ============================================================================

export interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  availability_id: number;
  is_booked: boolean;
  location: string | null;
  is_virtual: boolean;
  meeting_link: string | null;
}

// ============================================================================
// BOOKINGS
// ============================================================================

export interface MeetingBookingWithNames {
  id: number;
  parent_name: string;
  student_name: string;
  teacher_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string | null;
  is_virtual: boolean;
  meeting_link: string | null;
  teacher_notes: string | null;
  cancelled_reason: string | null;
}

export interface NewMeetingBooking {
  availability_id: number;
  student_id: number;
  teacher_id: number;
  date: string;
  start_time: string;
}

export interface CancelMeetingBooking {
  reason?: string;
}

export interface MeetingNotes {
  notes: string;
}

// ============================================================================
// FILTERS
// ============================================================================

export interface AvailabilityFilter {
  teacher_id?: number;
}

export interface MeetingBookingFilter {
  teacher_id?: number;
}
