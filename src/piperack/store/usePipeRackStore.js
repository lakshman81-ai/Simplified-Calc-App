import { create } from 'zustand';

const initialState = {
  // Global Rack Settings
  globalSettings: {
    anchorDistanceFt: 200, // Distance between anchors (straight run)
    defaultSpacingFt: 2.5, // Standard spacing step
    allowableStressPsi: 20000, // SA limit
  },

  // Pipe Lines (Array of line objects)
  lines: [
    {
      id: 'L1',
      sizeNps: 16,
      schedule: '40',
      material: 'Carbon Steel',
      tOperate: 150,
      insulationThk: 2.0, // inches
      hasVessel: false,
      vesselData: { R_mm: 800, T_mm: 20, r_n_mm: 100, f_MPa: 138 }
    }
  ],

  // Calculation Results
  results: null,
};

export const usePipeRackStore = create((set) => ({
  ...initialState,

  updateGlobalSetting: (key, value) => set((state) => ({
    globalSettings: { ...state.globalSettings, [key]: value }
  })),

  addLine: () => set((state) => {
    const newId = `L${state.lines.length + 1}`;
    const newLine = {
      id: newId,
      sizeNps: 8,
      schedule: '40',
      material: 'Carbon Steel',
      tOperate: 300,
      insulationThk: 0,
      hasVessel: false,
      vesselData: { R_mm: 800, T_mm: 20, r_n_mm: 100, f_MPa: 138 }
    };
    return { lines: [...state.lines, newLine] };
  }),

  removeLine: (id) => set((state) => ({
    lines: state.lines.filter(l => l.id !== id)
  })),

  updateLine: (id, key, value) => set((state) => ({
    lines: state.lines.map(l => l.id === id ? { ...l, [key]: value } : l)
  })),

  updateLineVessel: (id, key, value) => set((state) => ({
    lines: state.lines.map(l => {
      if (l.id === id) {
        return { ...l, vesselData: { ...l.vesselData, [key]: value } };
      }
      return l;
    })
  })),

  setResults: (results) => set({ results }),

  reset: () => set(initialState)
}));
