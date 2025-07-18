"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useSubjectsStore from "@/store/subjectsStore";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  preceptor_id?: number;
}

interface TimetableDisplayProps {
  courseId: number;
  onBack: () => void;
  initialTimetables?: Timetable[];
}

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const daysEnglish = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeBlocks = [
  { num: 1, range: "07:20-08:00" },
  { num: 2, range: "08:00-08:40" },
  { num: 3, range: "08:50-09:30" },
  { num: 4, range: "09:30-10:10" },
  { num: 5, range: "10:25-11:00" },
  { num: 6, range: "11:00-11:40" },
  { num: 7, range: "11:50-12:30" },
  { num: 8, range: "12:30-13:00" },
];

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({
  courseId,
  onBack,
  initialTimetables,
}) => {
  const [timetables, setTimetables] = useState<Timetable[]>(
    initialTimetables || []
  );
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(!initialTimetables);
  const subjectsStore = useSubjectsStore();
  const { subjects, fetchSubjects } = subjectsStore;

  useEffect(() => {
    if (initialTimetables && initialTimetables.length > 0) {
      setTimetables(initialTimetables);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching timetables for courseId:", courseId);
        console.log("Current cookies:", document.cookie);

        // Verificar si hay JWT cookie
        const jwtCookie = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("jwt="));
        console.log("JWT cookie found:", !!jwtCookie);
        if (jwtCookie) {
          console.log(
            "JWT cookie value:",
            jwtCookie.split("=")[1].substring(0, 20) + "..."
          );
        }

        // Solo hacer la llamada de timetables por ahora
        const timetableRes = await axios.get(
          `http://localhost:8080/api/v1/timetables/?course_id=${courseId}`,
          {
            withCredentials: true,
          }
        );

        console.log("Timetables response status:", timetableRes.status);
        console.log("Timetables response headers:", timetableRes.headers);
        console.log("Timetables response:", timetableRes);
        console.log("Timetables data:", timetableRes.data);
        console.log("Timetables data type:", typeof timetableRes.data);
        console.log(
          "Timetables data length:",
          Array.isArray(timetableRes.data)
            ? timetableRes.data.length
            : "not array"
        );

        setTimetables(timetableRes.data);

        // Cargar subjects si no están cargados
        if (subjects.length === 0) {
          console.log("Fetching subjects...");
          await fetchSubjects();
        }

        toast.success("Horario cargado exitosamente");
      } catch (error) {
        console.error("Error loading timetable:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            headers: error.response?.headers,
          });
        }
        toast.error("Error al cargar el horario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, subjects.length, fetchSubjects, initialTimetables]);

  // Construir matriz [bloque][día] => array de clases
  const table: Timetable[][][] = Array.from({ length: timeBlocks.length }, () =>
    Array(days.length)
      .fill(null)
      .map(() => [] as Timetable[])
  );

  timetables.forEach((tt) => {
    // Calcular en qué bloques cae este horario
    const [startH, startM] = tt.start_time.split(":").map(Number);
    const [endH, endM] = tt.end_time.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const dayIdx = daysEnglish.indexOf(tt.day);

    for (let i = 0; i < timeBlocks.length; i++) {
      const [blockStart, blockEnd] = timeBlocks[i].range.split("-");
      const [bh, bm] = blockStart.split(":").map(Number);
      const [eh, em] = blockEnd.split(":").map(Number);
      const blockStartMinutes = bh * 60 + bm;
      const blockEndMinutes = eh * 60 + em;
      // Si el bloque y el horario se solapan
      if (startMinutes < blockEndMinutes && endMinutes > blockStartMinutes) {
        table[i][dayIdx].push(tt);
      }
    }
  });

  function getSubjectName(subjectId: number) {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Sin materia";
  }

  const getCourseLabel = (course: Course) => {
    let yearLabel = "";
    let divisionLabel = "";

    if (course.year >= 8) {
      yearLabel = `${course.year - 7}° secundaria`;
      if (course.division === "1") divisionLabel = "a";
      else if (course.division === "2") divisionLabel = "b";
      else if (course.division === "3") divisionLabel = "c";
      else divisionLabel = course.division;
    } else {
      yearLabel = `${course.year}° primaria`;
      if (course.division === "1") divisionLabel = "Mar";
      else if (course.division === "2") divisionLabel = "Gaviota";
      else if (course.division === "3") divisionLabel = "Estrella";
      else divisionLabel = course.division;
    }

    return `${yearLabel} ${divisionLabel}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando horario...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso y título del curso */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Horario - Curso {courseId}
          </h1>
          <p className="text-muted-foreground">
            Timetables encontrados: {timetables.length}
          </p>
        </div>
      </div>

      {/* Debug info */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>
          <strong>Course ID:</strong> {courseId}
        </p>
        <p>
          <strong>Timetables count:</strong> {timetables.length}
        </p>
        <p>
          <strong>Subjects count:</strong> {subjects.length}
        </p>
        <p>
          <strong>Timetables:</strong>
        </p>
        <ul className="ml-4">
          {timetables.map((tt, index) => (
            <li key={tt.id}>
              {index + 1}. ID: {tt.id}, Subject: {tt.subject_id}, Day: {tt.day},
              Time: {tt.start_time}-{tt.end_time}
            </li>
          ))}
        </ul>
      </div>

      {/* Tabla del horario simplificada */}
      {timetables.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border">
          <h3 className="font-semibold mb-4">Horario:</h3>
          <div className="grid grid-cols-6 gap-2 text-sm">
            <div className="font-bold">Hora</div>
            <div className="font-bold">Lunes</div>
            <div className="font-bold">Martes</div>
            <div className="font-bold">Miércoles</div>
            <div className="font-bold">Jueves</div>
            <div className="font-bold">Viernes</div>

            {timeBlocks.map((block, i) => (
              <React.Fragment key={block.num}>
                <div className="font-bold">{block.num}</div>
                {days.map((_, j) => {
                  const dayTimetables = timetables.filter(
                    (tt) =>
                      tt.day === daysEnglish[j] &&
                      tt.start_time <= block.range.split("-")[1] &&
                      tt.end_time >= block.range.split("-")[0]
                  );
                  return (
                    <div key={j} className="p-2 border min-h-[40px]">
                      {dayTimetables.map((tt, idx) => (
                        <div key={idx} className="text-xs">
                          {getSubjectName(tt.subject_id)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableDisplay;
