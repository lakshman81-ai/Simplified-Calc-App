import { create } from 'zustand';
import materialsDb from './databases/materials.json';
import schedulesDb from './databases/schedules.json';
import { runExtendedSolver } from './ExtendedSolver';

export const useExtendedStore = create((set, get) => ({
  nodes: [],
  materials: materialsDb,
  schedules: schedulesDb,
  config: {
    useB313Legacy: true,
    applyStressRangeReduction: false,
    activeSolvers: ['thermal', 'sif', 'guided_cantilever'],
    verboseDebug: false,
  },
  results: null,
  logs: [],

  setNodes: (nodes) => set({ nodes }),

  updateConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),

  runSolver: () => {
    const state = get();

    // Add logic to save specific runs to a session log
    const timestamp = new Date().toISOString();
    state.appendLog(`[${timestamp}] Running Extended Solver...`);

    const payload = {
      nodes: state.nodes,
      materials: state.materials,
      schedules: state.schedules,
      config: state.config,
    };

    try {
      const results = runExtendedSolver(payload);
      set({ results });

      if (state.config.verboseDebug) {
        state.appendLog(`Solver Results: ${JSON.stringify(results, null, 2)}`);
      }

      state.appendLog(`[${timestamp}] Solver completed successfully.`);
    } catch (error) {
      set({ results: { errors: [error.message] } });
      state.appendLog(`[${timestamp}] ERROR: ${error.message}`);
    }
  },

  appendLog: (logMessage) => set((state) => ({
    logs: [...state.logs, logMessage]
  })),

  clearLogs: () => set({ logs: [] }),
}));
