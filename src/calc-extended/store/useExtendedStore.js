import { create } from 'zustand';

const initialState = {
  // UI State
  activeView: 'dashboard', // 'dashboard' | '3d-solver'
  calculationStatus: 'AWAITING_ANCHORS', // 'AWAITING_ANCHORS' | 'READY' | 'CALCULATED'
  heatmapMode: 'STRESS', // 'STRESS' | 'FORCE'

  // Geometry (Walled Garden - isolated clone)
  nodes: [],
  segments: [],
  anchors: { anchor1: null, anchor2: null },

  // Piping Inputs
  inputs: {
    material: 'Carbon Steel',
    pipeSize: 8.0,
    schedule: '40',
    tInstall: 70,
    tOperate: 300,
  },

  // Boundary Movement
  boundaryMovement: {
    x: 0,
    y: 0,
    z: 0,
  },

  // System Limits
  constraints: {
    equipmentMaterial: 'Steel',
    maxStress: 20000,
  },

  // Calculation Results
  results: null,
};

export const useExtendedStore = create((set) => ({
  ...initialState,

  setActiveView: (view) => set({ activeView: view }),
  setHeatmapMode: (mode) => set({ heatmapMode: mode }),

  updateInput: (key, value) => set((state) => ({
    inputs: { ...state.inputs, [key]: value }
  })),

  updateBoundaryMovement: (key, value) => set((state) => ({
    boundaryMovement: { ...state.boundaryMovement, [key]: value }
  })),

  updateConstraint: (key, value) => set((state) => ({
    constraints: { ...state.constraints, [key]: value }
  })),

  // One-way hydration from global store
  importFromGlobal: (globalNodes, globalSegments) => set(() => {
    // Deep clone to ensure walled garden
    const nodesClone = JSON.parse(JSON.stringify(globalNodes || []));
    const segmentsClone = JSON.parse(JSON.stringify(globalSegments || []));

    return {
      nodes: nodesClone,
      segments: segmentsClone,
      anchors: { anchor1: null, anchor2: null }, // Reset anchors on import
      calculationStatus: 'AWAITING_ANCHORS',
      results: null
    };
  }),

  // Anchor Assignment
  setAnchor: (anchorNum, nodeId) => set((state) => {
    const newAnchors = { ...state.anchors, [`anchor${anchorNum}`]: nodeId };
    const status = (newAnchors.anchor1 && newAnchors.anchor2) ? 'READY' : 'AWAITING_ANCHORS';
    return { anchors: newAnchors, calculationStatus: status };
  }),

  // Set Results from Solver
  setResults: (results) => set({
    results,
    calculationStatus: 'CALCULATED'
  }),

  // Reset module
  reset: () => set(initialState)
}));
