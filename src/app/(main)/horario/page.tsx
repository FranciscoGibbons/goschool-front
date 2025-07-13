"use client";

import React, { useEffect, useState } from 'react';

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  start_time: string;
  end_time: string;
  day: string;
}

interface Subject {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
}

const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimetablePage: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jwt = 'your_jwt_token_here';
        
        // Fetch timetables
        const timetableResponse = await fetch('http://localhost:8080/api/v1/timetables/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cookie': `jwt=${jwt}`
          }
        });

        // Fetch subjects
        const subjectsResponse = await fetch('http://localhost:8080/api/v1/subjects/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cookie': `jwt=${jwt}`
          }
        });

        if (!timetableResponse.ok || !subjectsResponse.ok) {
          throw new Error('Error al obtener los datos');
        }

        const timetableData = await timetableResponse.json();
        const subjectsData = await subjectsResponse.json();

        setTimetables(timetableData);
        setSubjects(subjectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener el nombre de la asignatura
  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : `Asignatura ${subjectId}`;
  };

  // Agrupar horarios por día
  const timetablesByDay = daysOrder.reduce((acc, day) => {
    acc[day] = timetables.filter(item => item.day === day);
    return acc;
  }, {} as Record<string, Timetable[]>);

  if (loading) {
    return <div className="p-4">Cargando horarios...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">HORARIO SEMANAL</h1>
      
      <div className="space-y-8">
        {daysOrder.map(day => {
          const dayTimetables = timetablesByDay[day];
          if (!dayTimetables || dayTimetables.length === 0) return null;

          return (
            <div key={day} className="border-b border-gray-300 pb-6 last:border-0">
              <h2 className="text-xl font-bold mb-4 uppercase">{day}</h2>
              <div className="space-y-2">
                {dayTimetables.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{getSubjectName(item.subject_id)}</span>
                    <span className="text-gray-700">
                      {item.start_time.split(':').slice(0, 2).join(':')} - {item.end_time.split(':').slice(0, 2).join(':')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimetablePage;
