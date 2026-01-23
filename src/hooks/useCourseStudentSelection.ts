import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Role } from "@/utils/types";
import childSelectionStore from "@/store/childSelectionStore";
import { fetchAllPages } from "@/utils/fetchAllPages";

// Estructura que devuelve el backend en /api/proxy/students/ (ahora incluye full_name)
interface PubUser {
  id: number;
  photo: string | null;
  course_id: number | null;
  full_name: string; // Ahora incluye full_name directamente
}

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
  photo?: string | null; // Permitir null como en PubUser
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
  retryLoadCourses: () => void;
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

  // Función para cargar cursos con mejor manejo de errores
  const fetchCourses = useCallback(async () => {
    if (!userRole) return;

    try {
      setIsLoading(true);
      setError(null);

      if (userRole === "father") {
        // Para padres, no necesitamos cursos, usamos los hijos
        setCourses([]);
        return;
      }

      const coursesResult = await fetchAllPages<Course>('/api/proxy/courses/');

      console.log("Courses loaded:", coursesResult);

      let dedupedCourses: Course[];
      const incoming: Course[] = coursesResult;

      if (userRole === "admin") {
        // Deduplicar por clave compuesta (mismo año/división/nivel/turno) y quedarse con el id más bajo
        const byComposite: Record<string, Course> = {};
        for (const c of incoming) {
          const key = `${c.year}-${c.division}-${c.level}-${c.shift}`;
          if (!byComposite[key] || c.id < byComposite[key].id) {
            byComposite[key] = c;
          }
        }
        dedupedCourses = Object.values(byComposite);
      } else {
        // Deduplicar por id para otros roles
        const uniqueById: Record<number, Course> = {} as Record<number, Course>;
        for (const c of incoming) {
          uniqueById[c.id] = uniqueById[c.id] ?? c;
        }
        dedupedCourses = Object.values(uniqueById);
      }

      // Generar nombres para los cursos
      const coursesWithNames = dedupedCourses.map((course: Course) => ({
        ...course,
        name: `${course.year}° ${course.division} - ${
          course.level === "primary" ? "Primaria" : "Secundaria"
        } (${course.shift === "morning" ? "Mañana" : "Tarde"})`,
      }));

      console.log("Courses with names:", coursesWithNames);
      setCourses(coursesWithNames);
    } catch (err) {
      console.error("Error loading courses:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los cursos";
      setError(errorMessage);
      toast.error("Error al cargar los cursos");
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  // Cargar cursos al montar o cambiar rol
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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

  const loadStudents = useCallback(async (courseId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("=== LOAD STUDENTS DEBUG ===");
      console.log("Course ID solicitado:", courseId);

      // Obtener estudiantes del backend (ahora incluye full_name)
      const pubUsers = await fetchAllPages<PubUser>('/api/proxy/students/', { course_id: courseId });

      console.log("Cantidad de estudiantes:", pubUsers.length);
      console.log("=============================");

      console.log("Estudiantes RAW del backend:", pubUsers.length);
      console.log("Course IDs de los estudiantes:", pubUsers.map(u => u.course_id));
      console.log("Expected course ID:", courseId);

      if (pubUsers.length === 0) {
        console.log("No hay estudiantes para el curso", courseId);
        setStudents([]);
        return;
      }

      // Convertir PubUser a Student
      const studentsData: Student[] = pubUsers.map((pubUser: PubUser) => {
        const fullName = pubUser.full_name || `Estudiante ${pubUser.id}`;
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "Estudiante";
        const lastName = nameParts.slice(1).join(" ") || `${pubUser.id}`;

        // Procesar la URL de la foto usando el proxy de imágenes
        let processedPhoto: string | null = null;
        if (pubUser.photo) {
          let fileName = pubUser.photo;
          
          console.log(`🔧 Procesando foto para ${fullName}:`, pubUser.photo);
          
          // Si viene con estructura de path completa, extraer solo el nombre del archivo
          if (fileName.includes('/uploads/profile_pictures/')) {
            fileName = fileName.split('/uploads/profile_pictures/').pop() || fileName;
          }
          // Si viene con ./ al inicio, quitarlo
          fileName = fileName.replace(/^\.\//, '');
          // Si aún contiene path, quedarnos solo con el nombre del archivo
          fileName = fileName.split('/').pop() || fileName;
          
          // Usar el proxy interno para evitar problemas de certificados SSL
          processedPhoto = `/api/image-proxy/uploads/profile_pictures/${fileName}`;
          console.log(`📷 URL procesada para ${fullName}:`, processedPhoto);
        } else {
          console.log(`❌ Sin foto para ${fullName}`);
        }

        return {
          id: pubUser.id,
          name: firstName,
          last_name: lastName,
          full_name: fullName,
          email: `estudiante${pubUser.id}@escuela.com`,
          course_id: pubUser.course_id || courseId,
          photo: processedPhoto,
        };
      });
      
      // Filtrar estudiantes válidos y eliminar duplicados
      const validStudents = studentsData
        .filter((student) => student && student.id)
        .filter((student, index, arr) => 
          arr.findIndex((s) => s.id === student.id) === index
        );

      console.log("Final students data:", validStudents);
      console.log("Estudiantes válidos procesados:", validStudents.length);
      setStudents(validStudents);

    } catch (err) {
      console.error("=== ERROR LOADING STUDENTS ===");
      console.error("Course ID:", courseId);
      console.error("Error completo:", err);
      
      if (axios.isAxiosError(err)) {
        console.error("Status:", err.response?.status);
        console.error("Status Text:", err.response?.statusText);
        console.error("Response data:", err.response?.data);
        console.error("Request config:", err.config);
        
        const errorMessage = err.response?.data?.error || err.response?.data || err.message || "Error al cargar los estudiantes";
        setError(`Error ${err.response?.status}: ${errorMessage}`);
        toast.error(`Error ${err.response?.status} al cargar estudiantes: ${errorMessage}`);
      } else {
        console.error("Error no-axios:", err);
        const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar los estudiantes";
        setError(errorMessage);
        toast.error("Error al cargar los estudiantes");
      }
      
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetSelectedCourseId = useCallback((courseId: number) => {
    setSelectedCourseId(courseId);
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setStudents([]);

    // Cargar estudiantes del curso seleccionado
    if (userRole !== "father") {
      loadStudents(courseId);
    }
  }, [userRole, loadStudents]);

  const handleSetSelectedStudentId = useCallback((studentId: number | null) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
  }, [students]);

  const resetSelection = useCallback(() => {
    setSelectedCourseId(null);
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setStudents([]);
    setError(null);
  }, []);

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
    retryLoadCourses: fetchCourses,
  };
}
