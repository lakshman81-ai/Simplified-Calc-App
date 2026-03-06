import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  activeTab: 'viewer', // 'viewer' or 'transform'
  setActiveTab: (tab) => set({ activeTab: tab }),

  components: [],
  setComponents: (comps) => set({ components: comps }),

  selectedIds: new Set(),
  toggleSelection: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    });
  },
  clearSelection: () => set({ selectedIds: new Set() }),

  transformMode: 'Auto', // 'Auto', 'L', 'Z', 'Loop'
  setTransformMode: (mode) => set({ transformMode: mode }),
}));
