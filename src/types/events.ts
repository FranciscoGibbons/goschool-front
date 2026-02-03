export interface SchoolEvent {
  id: number;
  title: string;
  description: string | null;
  event_type: 'artistic' | 'sports' | 'cultural' | 'academic' | 'institutional' | 'other';
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  course_id: number | null;
  academic_year_id: number | null;
  created_by: number;
  creator_name: string;
  created_at: string;
}

export const EVENT_TYPES = {
  artistic: 'Artistico',
  sports: 'Deportivo',
  cultural: 'Cultural',
  academic: 'Academico',
  institutional: 'Institucional',
  other: 'Otro',
} as const;

export type EventType = keyof typeof EVENT_TYPES;
