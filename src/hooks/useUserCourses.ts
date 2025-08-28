"use client";

import { useState, useEffect, useCallback } from "react";
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
  refresh: () => Promise<void>;
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useUserCourses = (): UseUserCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user role
      const role = await fetchWithAuth('/api/proxy/role');
      setUserRole(role);

      // Get courses based on role
      const coursesData = await fetchWithAuth('/api/proxy/courses');
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      setError("Error al cargar los cursos del usuario");
      
      // Redirect to login on 401
      if (error instanceof Error && error.message.includes('401')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Determine if user has multiple courses
  const hasMultipleCourses = courses.length > 1;

  return {
    courses,
    userRole,
    hasMultipleCourses,
    isLoading,
    error,
    refresh: fetchUserData,
  };
};
