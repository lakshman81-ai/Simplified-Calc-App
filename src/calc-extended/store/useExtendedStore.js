import { create } from 'zustand';

export const useExtendedStore = create((set) => ({
  config: {
    verboseDebugMode: false,
    useStrictB313SIF: false,
    globalTemperatureOverride: null,
    ignoreAxialStress: true
  },
  payload: {
    systemParams: {
      ambientTemp: 21,
      operatingTemp: 150,
      material: 'A106-B',
      pipeSize: 'NPS6',
      schedule: 'sch40'
    },
    nodes: [],
    elements: []
  },
  results: {
    nodeResults: {},
    elementResults: {},
    isCalculating: false,
    error: null
  },
  setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),
  setPayload: (newPayload) => set((state) => ({ payload: { ...state.payload, ...newPayload } })),
  setResults: (newResults) => set((state) => ({ results: { ...state.results, ...newResults } }))
}));
