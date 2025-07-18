"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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

        // Obtener rol del usuario
        const roleResponse = await axios.get(
          "http://localhost:8080/api/v1/role/",
          {
            withCredentials: true,
          }
        );
        const role = roleResponse.data;
        console.log("User role:", role);
        setUserRole(role);

        // Obtener cursos según el rol
        let coursesData: Course[] = [];

        console.log("Fetching courses for role:", role);
        const coursesResponse = await axios.get(
          "http://localhost:8080/api/v1/courses/",
          {
            withCredentials: true,
          }
        );
        coursesData = coursesResponse.data;
        console.log("Raw courses response:", coursesResponse);
        console.log("Courses data:", coursesData);

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching user courses:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
          });

          // Si es error de autenticación, redirigir al login
          if (error.response?.status === 401) {
            console.log("Authentication error, redirecting to login");
            window.location.href = "/login";
            return;
          }
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
