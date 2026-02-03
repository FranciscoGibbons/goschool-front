"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarEvent, eventColors } from "@/components/FullCalendarAgenda";
import { fetchAllPages } from "@/utils/fetchAllPages";
import { MeetingRequestWithNames } from "@/types/turnos";

interface AssessmentRaw {
  id: number;
  subject_id: number;
  task: string;
  due_date: string;
  type: string;
  questions?: string[];
  file_path?: string | null;
}

interface SubjectRaw {
  id: number;
  name: string;
  course_id: number;
}

interface TimetableRaw {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export type AgendaEventType = "assessment" | "meeting" | "class";

export interface AgendaFilters {
  showAssessments: boolean;
  showMeetings: boolean;
  showClasses: boolean;
}

interface UseAgendaEventsOptions {
  role: string | null;
  courseId: number | null;
  academicYearId: number | null;
  filters: AgendaFilters;
  showTimetables?: boolean;
}

interface UseAgendaEventsReturn {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

function getDayDatesInMonth(dayName: string, year: number, month: number): Date[] {
  const dayMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };

  const targetDay = dayMap[dayName];
  if (targetDay === undefined) return [];

  const dates: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === targetDay) {
      dates.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export function useAgendaEvents({
  role,
  courseId,
  academicYearId,
  filters,
  showTimetables = false,
}: UseAgendaEventsOptions): UseAgendaEventsReturn {
  const [assessments, setAssessments] = useState<AssessmentRaw[]>([]);
  const [subjects, setSubjects] = useState<SubjectRaw[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequestWithNames[]>([]);
  const [timetables, setTimetables] = useState<TimetableRaw[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;

    const isStudentOrFather = role === "student" || role === "father";
    if (!isStudentOrFather && !courseId) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number> = {};
        if (academicYearId) params.academic_year_id = academicYearId;

        const promises: Promise<void>[] = [];

        // Assessments
        promises.push(
          Promise.all([
            fetchAllPages<AssessmentRaw>("/api/proxy/assessments/", params),
            fetchAllPages<SubjectRaw>("/api/proxy/subjects/", params),
          ]).then(([assessmentsData, subjectsData]) => {
            setAssessments(assessmentsData);
            setSubjects(subjectsData);
          })
        );

        // Meetings (not for students)
        if (role !== "student") {
          promises.push(
            fetchAllPages<MeetingRequestWithNames>("/api/proxy/turnos/").then(
              (meetingsData) => {
                setMeetings(meetingsData);
              }
            )
          );
        }

        // Timetables (optional)
        if (showTimetables && courseId) {
          promises.push(
            fetchAllPages<TimetableRaw>("/api/proxy/timetables/", {
              course_id: courseId,
            }).then((timetablesData) => {
              setTimetables(timetablesData);
            })
          );
        }

        await Promise.all(promises);
      } catch (err) {
        console.error("Error loading agenda data:", err);
        setError("Error al cargar los datos de la agenda");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [role, courseId, academicYearId, showTimetables]);

  const events = useMemo(() => {
    const result: CalendarEvent[] = [];

    // Filter subjects by courseId for staff
    const filteredSubjects = courseId
      ? subjects.filter((s) => Number(s.course_id) === Number(courseId))
      : subjects;
    const subjectMap = new Map(filteredSubjects.map((s) => [s.id, s.name]));
    const subjectIdSet = new Set(filteredSubjects.map((s) => s.id));

    // Assessments
    if (filters.showAssessments) {
      const filteredAssessments = courseId
        ? assessments.filter((a) => subjectIdSet.has(a.subject_id))
        : assessments;

      for (const assessment of filteredAssessments) {
        const subjectName = subjectMap.get(assessment.subject_id) || "Materia";
        result.push({
          id: `assessment-${assessment.id}`,
          title: `${subjectName}: ${assessment.task}`,
          start: assessment.due_date,
          allDay: true,
          color: eventColors[assessment.type] || eventColors.default,
          extendedProps: {
            type: assessment.type,
            eventType: "assessment" as AgendaEventType,
            subjectName,
            task: assessment.task,
            dueDate: assessment.due_date,
            assessmentId: assessment.id,
          },
        });
      }
    }

    // Meetings
    if (filters.showMeetings && role !== "student") {
      const scheduledMeetings = meetings.filter(
        (m) => m.status === "accepted" && m.scheduled_date
      );

      for (const meeting of scheduledMeetings) {
        const startStr = meeting.scheduled_time
          ? `${meeting.scheduled_date}T${meeting.scheduled_time}`
          : meeting.scheduled_date!;
        result.push({
          id: `meeting-${meeting.id}`,
          title: `Reunion: ${meeting.subject}`,
          start: startStr,
          allDay: !meeting.scheduled_time,
          color: eventColors.meeting,
          extendedProps: {
            type: "meeting",
            eventType: "meeting" as AgendaEventType,
            requesterName: meeting.requester_name,
            receiverName: meeting.receiver_name,
            studentName: meeting.student_name,
            subject: meeting.subject,
            status: meeting.status,
            scheduledDate: meeting.scheduled_date,
            scheduledTime: meeting.scheduled_time,
            location: meeting.location,
            meetingId: meeting.id,
          },
        });
      }
    }

    // Timetables
    if (filters.showClasses && showTimetables && timetables.length > 0) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      for (const tt of timetables) {
        const dates = getDayDatesInMonth(tt.day, year, month);
        const subjectName = subjectMap.get(tt.subject_id) || "Clase";

        for (const date of dates) {
          const dateStr = date.toISOString().split("T")[0];
          result.push({
            id: `class-${tt.id}-${dateStr}`,
            title: subjectName,
            start: `${dateStr}T${tt.start_time}`,
            end: `${dateStr}T${tt.end_time}`,
            allDay: false,
            color: eventColors.class,
            extendedProps: {
              type: "class",
              eventType: "class" as AgendaEventType,
              subjectName,
              day: tt.day,
              startTime: tt.start_time,
              endTime: tt.end_time,
              timetableId: tt.id,
            },
          });
        }
      }
    }

    return result;
  }, [assessments, subjects, meetings, timetables, filters, courseId, role, showTimetables]);

  return { events, isLoading, error };
}
