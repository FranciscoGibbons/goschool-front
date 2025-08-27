import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Role } from "@/utils/types";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";

interface Course {
  id: number;
  name: string;
  year: number;
  division: string;
  level: string;
  shift: string;
  preceptor_id?: number;
  student_count?: number;
}

interface Student {
  id: number;
  name: string;
  last_name: string;
  full_name: string;
  email: string;
  course_id: number;
  photo?: string;
}

interface UseCourseStudentSelectionReturn {
  courses: Course[];
  students: Student[];
  selectedCourseId: number | null;
  selectedStudentId: number | null;
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  setSelectedCourseId: (courseId: number) => void;
  setSelectedStudentId: (studentId: number | null) => void;
  resetSelection: () => void;
  loadStudents: (courseId: number) => Promise<void>;
}

export function useCourseStudentSelection(
  userRole: Role | null
): UseCourseStudentSelectionReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { selectedChild } = childSelectionStore();

  // Cargar cursos según el rol
  useEffect(() => {
    if (!userRole) return;

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (userRole === "father") {
          // Para padres, no necesitamos cursos, usamos los hijos
          setCourses([]);
          return;
        }

        const coursesData = await axios.get(`/api/proxy/courses/`, {
          withCredentials: true,
        });
        const coursesResult = coursesData.data;

        console.log("Courses loaded:", coursesResult);

        // Generar nombres para los cursos
        const coursesWithNames = coursesResult.map((course: Course) => ({
          ...course,
          name: `${course.year}° ${course.division} - ${
            course.level === "primary" ? "Primaria" : "Secundaria"
          } (${course.shift === "morning" ? "Mañana" : "Tarde"})`,
        }));

        console.log("Courses with names:", coursesWithNames);
        setCourses(coursesWithNames);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Error al cargar los cursos");
        toast.error("Error al cargar los cursos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [userRole]);

  // Para padres, manejar la selección automática del hijo
  useEffect(() => {
    if (userRole === "father" && selectedChild) {
      // Convertir el hijo seleccionado a formato de estudiante
      const childAsStudent: Student = {
        id: selectedChild.id,
        name: selectedChild.name,
        last_name: selectedChild.last_name,
        full_name: `${selectedChild.name} ${selectedChild.last_name}`,
        email: "", // Los hijos pueden no tener email visible para el padre
        course_id: selectedChild.course_id,
        photo: undefined,
      };

      setSelectedStudentId(selectedChild.id);
      setSelectedStudent(childAsStudent);
      setSelectedCourseId(selectedChild.course_id);
      setStudents([childAsStudent]);
    }
  }, [userRole, selectedChild]);

  const loadStudents = async (courseId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const studentsData = await axios.get(
        `/api/proxy/students/?course_id=${courseId}`, {
          withCredentials: true,
        }
      );
      const studentsResult = studentsData.data;

      console.log("Students API response (IDs only):", studentsResult);

      // Si la respuesta son solo IDs, obtener los datos completos de cada estudiante
      if (studentsResult.length > 0 && typeof studentsResult[0] === "number") {
        console.log("Fetching complete student data for IDs:", studentsResult);

        const studentPromises = studentsResult.map(async (studentId: number) => {
          try {
            console.log(`Fetching data for student ID: ${studentId}`);

            const studentData = await axios.get(
              `/api/proxy/public-personal-data/?id=${studentId}`, {
                withCredentials: true,
              }
            );
            const studentDataResult = studentData.data;
            console.log(
              `Raw response for student ${studentId}:`,
              studentDataResult
            );

            // La API devuelve un array de todos los usuarios, necesitamos agregar el ID manualmente
            const processedStudentData = Array.isArray(studentDataResult)
              ? studentDataResult[0]
              : studentDataResult;
            console.log(
              `Processed data for student ${studentId}:`,
              processedStudentData
            );

            // Agregar el ID que falta y asegurar que tenga la estructura correcta
            const processedStudent = {
              id: studentId,
              name: processedStudentData?.full_name?.split(" ")[0] || "Estudiante",
              last_name:
                processedStudentData?.full_name?.split(" ").slice(1).join(" ") ||
                `${studentId}`,
              full_name: processedStudentData?.full_name || `Estudiante ${studentId}`,
              email: `estudiante${studentId}@escuela.com`,
              course_id: courseId,
              photo: processedStudentData?.photo,
            };

            console.log(
              `Final processed student ${studentId}:`,
              processedStudent
            );
            return processedStudent;
          } catch (err) {
            console.error(`Error fetching student ${studentId}:`, err);
            return null;
          }
        });

        const processedStudents = await Promise.all(studentPromises);
        const validStudents = processedStudents
          .filter((student) => student !== null && student.id)
          .map((student: Student) => ({
            ...student,
            full_name:
              student.full_name ||
              `${student.name || ""} ${student.last_name || ""}`.trim(),
          }));

        console.log("Complete students data:", validStudents);
        setStudents(validStudents);
      } else {
        // Si ya son objetos completos, procesarlos normalmente
        const validStudents = studentsResult
          .filter((student: Student) => {
            if (!student.id) {
              console.warn("Student without ID found:", student);
              return false;
            }
            return true;
          })
          .map((student: Student) => ({
            ...student,
            full_name:
              student.full_name || `${student.name} ${student.last_name}`,
          }));

        console.log("Valid students:", validStudents);
        setStudents(validStudents);
      }
    } catch (err) {
      console.error("Error loading students:", err);
      setError("Error al cargar los estudiantes");
      toast.error("Error al cargar los estudiantes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetSelectedCourseId = (courseId: number) => {
    setSelectedCourseId(courseId);
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setStudents([]);

    // Cargar estudiantes del curso seleccionado
    if (userRole !== "father") {
      loadStudents(courseId);
    }
  };

  const handleSetSelectedStudentId = (studentId: number | null) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
  };

  const resetSelection = () => {
    setSelectedCourseId(null);
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setStudents([]);
  };

  return {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    selectedStudent,
    isLoading,
    error,
    setSelectedCourseId: handleSetSelectedCourseId,
    setSelectedStudentId: handleSetSelectedStudentId,
    resetSelection,
    loadStudents,
  };
}
