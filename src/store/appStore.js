import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  activeTab: 'viewer', // 'viewer', 'datatable', 'transform', 'simpAnalysis', 'spl2bundle', 'config'
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

  // 3D to 2D Transformation states
  smart2DConversionEnabled: true,
  setSmart2DConversionEnabled: (enabled) => set({ smart2DConversionEnabled: enabled }),

  processParams: {
    deltaT: 148.9,
    od: 273.05,
    E: 199948,
    alpha: 0.00001116,
    Sa: 137.9,
    I: 66896169
  },
  setProcessParams: (newParams) => set((state) => ({
    processParams: { ...state.processParams, ...newParams }
  })),

  materialMapping: {}, // Map 3D CA material attributes to 2D Bundle Material names
  updateMaterialMapping: (caMaterial, bundleMaterial) => set((state) => ({
    materialMapping: { ...state.materialMapping, [caMaterial]: bundleMaterial }
  })),

  // Debug/Datatable stages
  processingStages: {
      stage1: [], // Selected 3D Data
      stage2: [], // 3D-to-2D Conversion Intermediate Data
  },
  setProcessingStage: (stageName, data) => set((state) => ({
      processingStages: { ...state.processingStages, [stageName]: data }
  })),

  // Store the actual 2D payload to send to the analysis canvas
  analysisPayload: null,
  setAnalysisPayload: (payload) => set({ analysisPayload: payload })
}));
