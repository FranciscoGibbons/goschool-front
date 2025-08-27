"use client";

import React, { useEffect, useState } from "react";

import { toast } from "sonner";
import useSubjectsStore from "@/store/subjectsStore";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const API_ENDPOINTS = {
  TIMETABLES: "/api/timetables",
  SUBJECTS: "/api/subjects",
  COURSES: "/api/courses"
};

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
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

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({
  courseId,
  onBack,
  initialTimetables,
}) => {
  const [timetables, setTimetables] = useState<Timetable[]>(
    initialTimetables || []
  );

  const [loading, setLoading] = useState(!initialTimetables);
  const subjectsStore = useSubjectsStore();
  const { subjects, setSubjects } = subjectsStore;

  useEffect(() => {
    if (initialTimetables && initialTimetables.length > 0) {
      setTimetables(initialTimetables);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        
        // Función para construir URLs con parámetros
        interface QueryParams {
          [key: string]: string | number | boolean | undefined | null;
        }
        
        const buildUrl = (baseUrl: string, params?: QueryParams) => {
          if (!params) return baseUrl;
          const query = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query.append(key, value.toString());
            }
          });
          return `${baseUrl}?${query.toString()}`;
        };

        // Obtener horarios
        const timetablesUrl = buildUrl(API_ENDPOINTS.TIMETABLES, { course_id: courseId });
        const timetablesResponse = await axios.get(timetablesUrl);
        const timetablesData = timetablesResponse.data;

        console.log("Timetables recibidos:", timetablesData);
        setTimetables(Array.isArray(timetablesData) ? timetablesData : []);

        // Cargar subjects específicos del curso
        const subjectsUrl = buildUrl(API_ENDPOINTS.SUBJECTS, { course_id: courseId });
        const subjectsResponse = await axios.get(subjectsUrl);
        const subjectsData = subjectsResponse.data;
        
        console.log("Subjects cargados:", subjectsData);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

        toast.success("Horario cargado exitosamente");
      } catch (error) {
        console.error("Error loading timetable:", error);
        toast.error("Error al cargar el horario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, initialTimetables, setSubjects]);

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
    if (!subject) {
      console.log(
        `Subject no encontrado para ID: ${subjectId}. Subjects disponibles:`,
        subjects
      );
    }
    return subject ? subject.name : `ID: ${subjectId}`;
  }

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
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
      </div>

      {/* Tabla del horario */}
      {timetables.length > 0 ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-1 text-sm min-w-[600px]">
              <div className="font-bold p-3 bg-muted rounded text-center">
                Hora
              </div>
              <div className="font-bold p-3 bg-muted rounded text-center">
                Lunes
              </div>
              <div className="font-bold p-3 bg-muted rounded text-center">
                Martes
              </div>
              <div className="font-bold p-3 bg-muted rounded text-center">
                Miércoles
              </div>
              <div className="font-bold p-3 bg-muted rounded text-center">
                Jueves
              </div>
              <div className="font-bold p-3 bg-muted rounded text-center">
                Viernes
              </div>

              {timeBlocks.map((block) => (
                <React.Fragment key={block.num}>
                  <div className="font-bold p-3 bg-muted/50 rounded text-center">
                    {block.num}
                  </div>
                  {days.map((_, j) => {
                    // Buscar el horario que coincide con este bloque
                    const blockStartTime = block.range.split("-")[0] + ":00";
                    const matchingTimetable = timetables.find(
                      (tt) =>
                        tt.day === daysEnglish[j] &&
                        tt.start_time === blockStartTime
                    );

                    // Debug log para el primer bloque del lunes
                    if (block.num === 1 && j === 0) {
                      console.log(
                        `Bloque 1, Lunes - blockStartTime: "${blockStartTime}"`
                      );
                      console.log(
                        `Timetables para Monday:`,
                        timetables.filter((tt) => tt.day === "Monday")
                      );
                    }

                    return (
                      <div
                        key={j}
                        className="p-3 border border-border rounded min-h-[60px] flex items-center justify-center"
                      >
                        {matchingTimetable ? (
                          <div className="text-center text-xs font-medium">
                            {getSubjectName(matchingTimetable.subject_id)}
                          </div>
                        ) : (
                          <div className="text-center text-xs text-muted-foreground">
                            -
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay horarios disponibles para este curso.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimetableDisplay;
