"use client";

import { useState, useEffect } from "react";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { Role } from "@/utils/types";

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  preceptor_id?: number;
}

interface UseUserCoursesReturn {
  courses: Course[];
  userRole: Role | null;
  hasMultipleCourses: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserCourses = (): UseUserCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching user role...");
        // Verificar si hay cookies
        console.log("Cookies:", document.cookie);

        
        // Obtener rol del usuario usando API directa
        const role = await apiClient.get(API_ENDPOINTS.ROLE);
        console.log("User role:", role);
        setUserRole(role);

        // Obtener cursos según el rol usando API directa
        console.log("Fetching courses for role:", role);
        const coursesData = await apiClient.get(API_ENDPOINTS.COURSES);
        console.log("Courses data:", coursesData);

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching user courses:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
          });
        }
        setError("Error al cargar los cursos del usuario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Determinar si el usuario tiene múltiples cursos
  const hasMultipleCourses = courses.length > 1;

  return {
    courses,
    userRole,
    hasMultipleCourses,
    isLoading,
    error,
  };
};
