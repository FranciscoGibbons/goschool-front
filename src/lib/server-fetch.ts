import { cookies } from 'next/headers';
import { cache } from 'react';
import https from 'https';
import { UserInfo, Exam, Role } from '@/utils/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Create HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

interface FetchOptions extends RequestInit {
  timeout?: number;
}

interface Course {
  id: number;
  name: string;
  year: number;
  section: string;
}

interface Subject {
  id: number;
  name: string;
  course_id: number;
  teacher_id?: number;
}

interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  assessment_id: number;
  grade: string;
  grade_type: string;
  description?: string;
  created_at: string;
}

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface Message {
  id: number;
  title: string;
  content: string;
  subject_id?: number;
  type: string;
  created_at: string;
  author_id: number;
}

class ServerFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ServerFetchError';
  }
}

/**
 * Server-side fetch utility with authentication and caching
 * Uses React.cache for automatic request deduplication
 */
export const serverFetch = cache(async <T = unknown>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> => {
  const { timeout = 10000, ...fetchOptions } = options;
  
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get('jwt');
    
    if (!jwtCookie) {
      throw new ServerFetchError('No authentication token found', 401);
    }

    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`🌐 Server fetch: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `jwt=${jwtCookie.value}`,
        ...fetchOptions.headers,
      },
      signal: controller.signal,
      // @ts-expect-error - Node.js specific agent property
      agent: url.startsWith('https:') ? httpsAgent : undefined,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ServerFetchError(
        `Server responded with ${response.status}: ${errorText}`,
        response.status,
        response
      );
    }

    const data = await response.json();
    console.log(`✅ Server fetch successful: ${endpoint}`);
    return data as T;
    
  } catch (error) {
    if (error instanceof ServerFetchError) {
      throw error;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ServerFetchError(`Request timeout after ${timeout}ms`, 408);
    }
    
    console.error(`❌ Server fetch error for ${endpoint}:`, error);
    throw new ServerFetchError(
      error instanceof Error ? error.message : 'Unknown fetch error',
      500
    );
  }
});

/**
 * Cached server functions for common data fetching
 */
export const getServerUserRole = cache(async (): Promise<Role | null> => {
  try {
    const role = await serverFetch<Role>('/api/v1/role/');
    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
});

export const getServerPersonalData = cache(async (): Promise<UserInfo> => {
  try {
    return await serverFetch<UserInfo>('/api/v1/personal-data/');
  } catch (error) {
    console.error('Error fetching personal data:', error);
    throw error;
  }
});

export const getServerCourses = cache(async (): Promise<Course[]> => {
  try {
    return await serverFetch<Course[]>('/api/v1/courses/');
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
});

export const getServerSubjects = cache(async (courseId?: string): Promise<Subject[]> => {
  try {
    const endpoint = courseId ? `/api/v1/subjects/?course_id=${courseId}` : '/api/v1/subjects/';
    return await serverFetch<Subject[]>(endpoint);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
});

export const getServerAssessments = cache(async (filters?: Record<string, string>): Promise<Exam[]> => {
  try {
    const queryString = filters ? 
      '?' + new URLSearchParams(filters).toString() : '';
    return await serverFetch<Exam[]>(`/api/v1/assessments/${queryString}`);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return [];
  }
});

export const getServerTimetables = cache(async (courseId?: string): Promise<Timetable[]> => {
  try {
    const endpoint = courseId ? `/api/v1/timetables/?course_id=${courseId}` : '/api/v1/timetables/';
    return await serverFetch<Timetable[]>(endpoint);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return [];
  }
});

export const getServerGrades = cache(async (filters?: Record<string, string>): Promise<Grade[]> => {
  try {
    const queryString = filters ? 
      '?' + new URLSearchParams(filters).toString() : '';
    return await serverFetch<Grade[]>(`/api/v1/grades/${queryString}`);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return [];
  }
});

export const getServerMessages = cache(async (subjectId?: string): Promise<Message[]> => {
  try {
    const endpoint = subjectId ? `/api/v1/messages/?subject_id=${subjectId}` : '/api/v1/messages/';
    return await serverFetch<Message[]>(endpoint);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
});

/**
 * Type-safe wrapper for server fetch with error handling
 */
export async function safeServerFetch<T>(
  fetchFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.error('Safe server fetch failed:', error);
    return fallback;
  }
}