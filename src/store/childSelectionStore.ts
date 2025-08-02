// src/store/childSelectionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Child } from "@/utils/types";

interface ChildSelectionState {
  selectedChildId: number | null;
  selectedChild: Child | null;
}

interface ChildSelectionActions {
  setSelectedChild: (child: Child) => void;
  clearSelectedChild: () => void;
}

type ChildSelectionStore = ChildSelectionState & ChildSelectionActions;

const childSelectionStore = create<ChildSelectionStore>()(
  persist(
    (set) => ({
      selectedChildId: null,
      selectedChild: null,

      setSelectedChild: (child: Child) => {
        set({ 
          selectedChildId: child.id, 
          selectedChild: child 
        });
      },

      clearSelectedChild: () => {
        set({ 
          selectedChildId: null, 
          selectedChild: null 
        });
      },
    }),
    {
      name: "child-selection-storage",
      partialize: (state) => ({
        selectedChildId: state.selectedChildId,
        selectedChild: state.selectedChild,
      }),
    }
  )
);

export default childSelectionStore;
