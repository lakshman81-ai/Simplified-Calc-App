import { create } from 'zustand';

const initialState = {
  // Global Rack Settings
  globalSettings: {
    anchorDistanceFt: 200, // Distance between anchors (straight run)
    defaultSpacingFt: 2.5, // Standard spacing step
    allowableStressPsi: 20000, // SA limit
  },

  // Advanced Structural Constraints
  structuralSettings: {
    beamWidth_mm: 300,
    gussetGap_mm: 100,
    futureSpacePct: 20,
    tierGap_mm: 3000,
    minClearanceGrade_mm: 4600
  },

  // UI Control
  isSectionCreatorOpen: false,

  // Pipe Lines (Array of line objects)
  lines: [
    {
      id: 'L1',
      sizeNps: 16,
      schedule: '40',
      service: 'Process-Liquid',
      material: 'Carbon Steel',
      tOperate: 150,
      insulationThk: 2.0, // inches
      flange: '300#',
      stagger: true,
      hasVessel: false,
      vesselData: { R_mm: 800, T_mm: 20, r_n_mm: 100, f_MPa: 138 },
      userOrderIndex: null // null implies auto-berthing
    }
  ],

  // Calculation Results
  results: null,
  sectionLayout: null // Holds X,Y coords for the Advanced Section Creator
};

export const usePipeRackStore = create((set) => ({
  ...initialState,

  toggleSectionCreator: (isOpen) => set({ isSectionCreatorOpen: isOpen }),

  updateGlobalSetting: (key, value) => set((state) => ({
    globalSettings: { ...state.globalSettings, [key]: value }
  })),

  updateStructuralSetting: (key, value) => set((state) => ({
    structuralSettings: { ...state.structuralSettings, [key]: value }
  })),

  addLine: () => set((state) => {
    const newId = `L${state.lines.length + 1}`;
    const newLine = {
      id: newId,
      sizeNps: 8,
      schedule: '40',
      service: 'Process-Gas',
      material: 'Carbon Steel',
      tOperate: 300,
      insulationThk: 0,
      flange: '150#',
      stagger: true,
      hasVessel: false,
      vesselData: { R_mm: 800, T_mm: 20, r_n_mm: 100, f_MPa: 138 },
      userOrderIndex: null
    };
    return { lines: [...state.lines, newLine] };
  }),

  removeLine: (id) => set((state) => ({
    lines: state.lines.filter(l => l.id !== id)
  })),

  updateLine: (id, key, value) => set((state) => ({
    lines: state.lines.map(l => l.id === id ? { ...l, [key]: value } : l)
  })),

  updateLineOverride: (id, dimKey, value) => set((state) => {
    if (!state.results) return state;
    return {
      results: {
        ...state.results,
        lines: state.results.lines.map(l => {
          if (l.id === id) {
            return {
              ...l,
              dimensions: { ...l.dimensions, [dimKey]: value }
            };
          }
          return l;
        })
      }
    };
  }),

  updateLineVessel: (id, key, value) => set((state) => ({
    lines: state.lines.map(l => {
      if (l.id === id) {
        return { ...l, vesselData: { ...l.vesselData, [key]: value } };
      }
      return l;
    })
  })),

  // Reorders pipes when dragged in Section Creator
  setPipeXOrder: (id, newX, currentLayout) => set((state) => {
      // Find where newX fits inside the current layout X coords
      // Update userOrderIndex of all lines to lock the auto-berthing override
      // This function will be triggered by drag-drop.
      return { ...state };
  }),

  setResults: (results) => set({ results }),
  setSectionLayout: (layout) => set({ sectionLayout: layout }),

  reset: () => set(initialState)
}));
