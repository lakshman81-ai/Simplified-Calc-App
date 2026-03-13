import { create } from 'zustand';

export const useExtendedStore = create((set, get) => ({
  // View State
  activeView: 'DASHBOARD', // 'DASHBOARD' | '3D_VIEW'
  setActiveView: (view) => set({ activeView: view }),

  // Piping Inputs
  material: 'Carbon Steel',
  setMaterial: (mat) => set({ material: mat }),
  nominalSize: 8.0,
  setNominalSize: (size) => set({ nominalSize: parseFloat(size) || 8.0 }),
  schedule: '40',
  setSchedule: (sch) => set({ schedule: sch }),
  tempInstall: 70,
  setTempInstall: (t) => set({ tempInstall: parseFloat(t) || 70 }),
  tempOperate: 300,
  setTempOperate: (t) => set({ tempOperate: parseFloat(t) || 300 }),

  // Boundary Movement (Anchor 1)
  boundaryMovement: { x: 0, y: 0, z: 0 },
  setBoundaryMovement: (axis, val) => set((state) => ({
    boundaryMovement: { ...state.boundaryMovement, [axis]: parseFloat(val) || 0 }
  })),

  // System Limits
  equipMaterial: 'Steel', // 'Steel' | 'Cast Iron'
  setEquipMaterial: (mat) => set({ equipMaterial: mat }),
  maxForceLimit: 1600, // Dynamically computed later, but UI displays it
  setMaxForceLimit: (val) => set({ maxForceLimit: val }),
  maxStressLimit: 20000, // Hardcoded per code

  // Geometry & Anchors
  geometryVectors: [], // [{dir, len, x, y, z}]
  anchor1: null,
  anchor2: null,
  setAnchor: (nodeId, isAnchor1) => set((state) => {
    if (isAnchor1) return { anchor1: nodeId };
    return { anchor2: nodeId };
  }),
  clearAnchors: () => set({ anchor1: null, anchor2: null }),

  // Auto-Detect & Short Drops
  detectedProfile: 'None',
  setDetectedProfile: (prof) => set({ detectedProfile: prof }),
  shortDropsIgnored: 0,
  setShortDropsIgnored: (count) => set({ shortDropsIgnored: count }),

  // Solver Outputs
  calculationStatus: 'AWAITING_ANCHORS', // 'AWAITING_ANCHORS' | 'READY' | 'CALCULATED'
  setCalculationStatus: (status) => set({ calculationStatus: status }),
  results: null, // Holds calculated force, stress, status per axis
  setResults: (res) => set({ results: res }),

  // 3D Viewport Controls
  heatmapMode: 'STRESS', // 'STRESS' | 'FORCE'
  setHeatmapMode: (mode) => set({ heatmapMode: mode }),

  // Global Import
  importFromGlobal: (globalComponents) => {
    // Basic parser: clone geometry into vectors for Extended Solver
    // Each component in globalComponents typically has an array of points
    const vectors = [];
    if (!globalComponents || globalComponents.length === 0) return;

    let nodeIdCounter = 1;
    for (let comp of globalComponents) {
        if (comp.points && comp.points.length >= 2) {
            for (let i = 0; i < comp.points.length - 1; i++) {
                const pt1 = comp.points[i];
                const pt2 = comp.points[i+1];
                const dx = pt2.x - pt1.x;
                const dy = pt2.y - pt1.y;
                const dz = pt2.z - pt1.z;

                let len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                let dir = '';
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) dir = dx > 0 ? '+X' : '-X';
                else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) dir = dy > 0 ? '+Y' : '-Y';
                else dir = dz > 0 ? '+Z' : '-Z';

                vectors.push({
                    id: `v${nodeIdCounter++}`,
                    startNodeId: `n${nodeIdCounter}`,
                    endNodeId: `n${nodeIdCounter+1}`,
                    dir,
                    len,
                    x: dx,
                    y: dy,
                    z: dz
                });
            }
        }
    }
    set({ geometryVectors: vectors });
  }
}));