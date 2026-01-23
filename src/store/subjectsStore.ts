import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";
import { AxiosError } from "axios";
import { fetchAllPages } from "@/utils/fetchAllPages";

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
  course_name?: string;
}

interface SubjectsState {
  courses: Course[];
  subjects: Subject[];
  selectedCourseId: number | null;
  selectedSubjectId: number | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

interface SubjectsActions {
  fetchCourses: () => Promise<Course[]>;
  fetchSubjects: (courseId?: number) => Promise<void>;
  setSelectedCourse: (courseId: number | null) => void;
  setSelectedSubject: (subjectId: number | null) => void;
  clearSelection: () => void;
  clearError: () => void;
  invalidateCache: () => void;
  reset: () => void;
  setSubjects: (subjects: Subject[]) => void;
}

type SubjectsStore = SubjectsState & SubjectsActions;

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;

const useSubjectsStore = create<SubjectsStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // State
          courses: [],
          subjects: [],
          selectedCourseId: null,
          selectedSubjectId: null,
          isLoading: false,
          error: null,
          lastFetch: null,

          // Actions
          fetchCourses: async (): Promise<Course[]> => {
            const state = get();
            
            // Use cache if valid
            if (
              state.courses.length > 0 && 
              state.lastFetch && 
              Date.now() - state.lastFetch < CACHE_DURATION
            ) {
              return state.courses;
            }

            try {
              set({ isLoading: true, error: null });

              const courses = await fetchAllPages<Course>('/api/proxy/courses/');

              set({
                courses,
                isLoading: false,
                lastFetch: Date.now(),
                error: null
              });

              return courses;
            } catch (error) {
              const errorMessage = error instanceof AxiosError 
                ? error.response?.data?.message || error.message
                : 'Error desconocido al cargar cursos';
                
              set({ 
                error: errorMessage, 
                isLoading: false 
              });
              
              throw error;
            }
          },

          fetchSubjects: async (courseId?: number): Promise<void> => {
            set({ isLoading: true, error: null });
            try {
              const params = courseId ? { course_id: courseId } : {};
              const subjects = await fetchAllPages<Subject>('/api/proxy/subjects/', params);

              set({ subjects, isLoading: false, error: null });
            } catch (error: unknown) {
              let errorMessage = "Error al cargar materias";
              if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || error.message;
              } else if (typeof error === "object" && error && "message" in error) {
                errorMessage = (error as { message?: string }).message || errorMessage;
              }
              set({
                error: errorMessage,
                isLoading: false,
              });
            }
          },

          setSelectedCourse: (courseId: number | null) => {
            set({ 
              selectedCourseId: courseId,
              selectedSubjectId: null, // Reset subject when course changes
              subjects: [] // Clear subjects when course changes
            });
            
            // Auto-fetch subjects if course is selected
            if (courseId) {
              get().fetchSubjects(courseId);
            }
          },

          setSelectedSubject: (subjectId: number | null) => {
            set({ selectedSubjectId: subjectId });
          },

          clearSelection: () => {
            set({ 
              selectedCourseId: null, 
              selectedSubjectId: null,
              subjects: []
            });
          },

          clearError: () => {
            set({ error: null });
          },

          invalidateCache: () => {
            set({ lastFetch: null });
          },

          reset: () => {
            set({
              courses: [],
              subjects: [],
              selectedCourseId: null,
              selectedSubjectId: null,
              isLoading: false,
              error: null,
              lastFetch: null,
            });
          },

          setSubjects: (subjects) => set({ subjects }),
        }),
        {
          name: "subjects-storage",
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            courses: state.courses,
            lastFetch: state.lastFetch,
            selectedCourseId: state.selectedCourseId,
            selectedSubjectId: state.selectedSubjectId,
          }),
          version: 1,
          migrate: (persistedState: unknown, version: number) => {
            if (version === 0) {
              // Clear old cache on migration
              return {
                courses: [],
                subjects: [],
                selectedCourseId: null,
                selectedSubjectId: null,
                lastFetch: null,
              };
            }
            return persistedState;
          },
        }
      )
    ),
    { name: "subjects-store" }
  )
);

// Selector hooks for performance optimization
export const useCoursesSelector = <T>(selector: (state: SubjectsStore) => T) =>
  useSubjectsStore(selector);

// Specific selectors
export const useCourses = () => useCoursesSelector(state => state.courses);
export const useSubjects = () => useCoursesSelector(state => state.subjects);
export const useSelectedCourse = () => useCoursesSelector(state => state.selectedCourseId);
export const useSelectedSubject = () => useCoursesSelector(state => state.selectedSubjectId);
export const useSubjectsLoading = () => useCoursesSelector(state => state.isLoading);
export const useSubjectsError = () => useCoursesSelector(state => state.error);

// Combined selectors for common use cases
export const useSelectedCourseData = () => useCoursesSelector(state => 
  state.courses.find(course => course.id === state.selectedCourseId) || null
);

export const useSelectedSubjectData = () => useCoursesSelector(state => 
  state.subjects.find(subject => subject.id === state.selectedSubjectId) || null
);

export default useSubjectsStore;
