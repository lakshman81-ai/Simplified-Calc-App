import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  activeTab: 'viewer', // 'viewer' or 'transform'
  setActiveTab: (tab) => set({ activeTab: tab }),

  components: [],
  setComponents: (comps) => set({ components: comps }),

  pcfText: '',
  setPcfText: (pcfText) => set({ pcfText }),

  updateComponentAttribute: (index, field, value) => set((state) => {
    const newComps = [...state.components];
    if (newComps[index] && newComps[index].attributes) {
      newComps[index].attributes[field] = value;
    }
    return { components: newComps };
  }),
  updateComponentPoint: (index, ptIndex, prop, value) => set((state) => {
    const newComps = [...state.components];
    if (newComps[index] && newComps[index].points && newComps[index].points[ptIndex]) {
      newComps[index].points[ptIndex][prop] = Number(value);
    }
    return { components: newComps };
  }),

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
