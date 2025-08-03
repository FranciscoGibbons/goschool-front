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
  fetchSubjects: () => Promise<void>;
  setSubjects: (subjects: Subject[]) => void;
}

const useSubjectsStore = create<SubjectsState>((set) => ({
  subjects: [],
  isLoading: false,
  error: null,
  fetchSubjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await axios.get(`${apiUrl}/api/v1/subjects/`, {
        withCredentials: true,
      });
      set({ subjects: res.data, isLoading: false });
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
