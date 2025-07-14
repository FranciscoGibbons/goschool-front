"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useSubjectsStore from "@/store/subjectsStore";

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
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

const TimetablePage: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const subjectsStore = useSubjectsStore();
  const { subjects, fetchSubjects } = subjectsStore;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timetableRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/timetables/", {
            withCredentials: true,
          }),
        ]);
        setTimetables(timetableRes.data);
        if (subjects.length === 0) await fetchSubjects();
        // LOGS para depuración
        console.log("Timetables:", timetableRes.data);
        console.log("Subjects (global store):", subjects);
        toast.success("Horario cargado exitosamente");
      } catch {
        toast.error("Error al cargar el horario");
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#18181b]">
      <div className="w-full max-w-4xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow border border-[#ececec] dark:border-[#232323] bg-white dark:bg-[#232323]">
          <table className="min-w-full border-separate border-spacing-0 text-[#232323] dark:text-white mx-auto text-center text-base">
            <thead>
              <tr className="bg-white dark:bg-[#232323]">
                <th className="text-xs font-bold text-[#232323] dark:text-white px-3 py-2 border-b border-[#ececec] dark:border-[#232323] text-center w-16">
                  Hora
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="text-xs font-bold text-[#232323] dark:text-white px-3 py-2 border-b border-[#ececec] dark:border-[#232323] text-center"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeBlocks.map((block, i) => (
                <tr
                  key={block.num}
                  className={
                    i % 2 === 0
                      ? "bg-white dark:bg-[#232323]"
                      : "bg-[#f8f8f8] dark:bg-[#18181b]"
                  }
                >
                  <td className="align-top px-3 py-2 border-b border-[#ececec] dark:border-[#232323] text-xs text-[#232323] dark:text-white font-bold text-center whitespace-nowrap">
                    <div>{block.num}</div>
                    <div>{block.range}</div>
                  </td>
                  {days.map((_, j) => (
                    <td
                      key={j}
                      className="align-top px-3 py-2 border-b border-[#ececec] dark:border-[#232323] text-base text-[#232323] dark:text-white text-center min-w-[90px] min-h-[28px]"
                    >
                      {table[i][j].length > 0 ? (
                        <div className="flex flex-col gap-1 items-center justify-center min-h-[28px]">
                          {table[i][j].map((tt, idx) => (
                            <div
                              key={idx}
                              className="font-bold text-base text-[#232323] dark:text-white leading-tight"
                            >
                              {capitalize(getSubjectName(tt.subject_id))}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Si faltan materias el viernes es porque el backend no las envía */}
      </div>
    </div>
  );
};

export default TimetablePage;
