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
      const res = await axios.get("http://localhost:8080/api/v1/subjects/", {
        withCredentials: true,
      });
      set({ subjects: res.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Error al cargar materias",
        isLoading: false,
      });
    }
  },
  setSubjects: (subjects) => set({ subjects }),
}));

export default useSubjectsStore;
