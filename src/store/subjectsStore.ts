import { create } from "zustand";
import axios from "axios";

interface Subject {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
}

interface SubjectsState {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  fetchSubjects: (courseId?: number) => Promise<void>;
  setSubjects: (subjects: Subject[]) => void;
}

const useSubjectsStore = create<SubjectsState>((set) => ({
  subjects: [],
  isLoading: false,
  error: null,
  fetchSubjects: async (courseId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const url = courseId 
        ? `/api/proxy/subjects/?course_id=${courseId}`
        : `/api/proxy/subjects/`;
      
      const response = await axios.get(url, {
        withCredentials: true,
      });
      const subjects = response.data;
      set({ subjects, isLoading: false });
    } catch (error: unknown) {
      let errorMessage = "Error al cargar materias";
      if (typeof error === "object" && error && "message" in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      }
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },
  setSubjects: (subjects) => set({ subjects }),
}));

export default useSubjectsStore;
