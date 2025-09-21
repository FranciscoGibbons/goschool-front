// src/store/childSelectionStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { Child } from "@/utils/types";

interface ChildSelectionState {
  selectedChildId: number | null;
  selectedChild: Child | null;
  children: Child[];
  isLoading: boolean;
  error: string | null;
}

interface ChildSelectionActions {
  setSelectedChild: (child: Child) => void;
  clearSelectedChild: () => void;
  setChildren: (children: Child[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type ChildSelectionStore = ChildSelectionState & ChildSelectionActions;

const childSelectionStore = create<ChildSelectionStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        selectedChildId: null,
        selectedChild: null,
        children: [],
        isLoading: false,
        error: null,

        // Actions
        setSelectedChild: (child: Child) => {
          set({ 
            selectedChildId: child.id, 
            selectedChild: child,
            error: null
          });
        },

        clearSelectedChild: () => {
          set({ 
            selectedChildId: null, 
            selectedChild: null 
          });
        },

        setChildren: (children: Child[]) => {
          const state = get();
          set({ 
            children,
            // Auto-select first child if none selected and children available
            ...((!state.selectedChild && children.length > 0) && {
              selectedChildId: children[0].id,
              selectedChild: children[0]
            }),
            error: null 
          });
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error, isLoading: false });
        },

        reset: () => {
          set({
            selectedChildId: null,
            selectedChild: null,
            children: [],
            isLoading: false,
            error: null,
          });
        },
      }),
      {
        name: "child-selection-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          selectedChildId: state.selectedChildId,
          selectedChild: state.selectedChild,
          children: state.children,
        }),
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          if (version === 0) {
            return {
              selectedChildId: null,
              selectedChild: null,
              children: [],
            };
          }
          return persistedState;
        },
      }
    ),
    { name: "child-selection-store" }
  )
);

// Selector hooks for performance optimization
export const useChildSelector = <T>(selector: (state: ChildSelectionStore) => T) =>
  childSelectionStore(selector);

// Specific selectors
export const useSelectedChild = () => useChildSelector(state => state.selectedChild);
export const useSelectedChildId = () => useChildSelector(state => state.selectedChildId);
export const useChildren = () => useChildSelector(state => state.children);
export const useChildSelectionLoading = () => useChildSelector(state => state.isLoading);
export const useChildSelectionError = () => useChildSelector(state => state.error);

// Combined selectors
export const useHasMultipleChildren = () => useChildSelector(state => 
  state.children.length > 1
);

export default childSelectionStore;
