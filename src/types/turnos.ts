export interface MeetingRequestWithNames {
  id: number;
  requester_id: number;
  requester_name: string;
  receiver_id: number;
  receiver_name: string;
  student_id: number;
  student_name: string;
  subject: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  location: string | null;
  cancelled_reason: string | null;
  created_at: string;
}

export interface NewMeetingRequest {
  receiver_id: number;
  student_id: number;
  subject: string;
}

export interface AcceptMeetingRequest {
  scheduled_date: string;
  scheduled_time: string;
  location?: string;
}

export interface CancelMeetingRequest {
  reason?: string;
}

export interface MeetingRequestFilter {
  meeting_id?: number;
  requester_id?: number;
  receiver_id?: number;
  student_id?: number;
  status?: string;
}
