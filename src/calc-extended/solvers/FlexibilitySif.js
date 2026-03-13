export const calculateFlexibilityFactor = (wallThickness_in, bendRadius_in, meanRadius_in) => {
  // h = t * R / r^2
  const h = (wallThickness_in * bendRadius_in) / (meanRadius_in * meanRadius_in);

  // k = 1.65 / h (must be >= 1.0)
  const k = Math.max(1.65 / h, 1.0);
  return k;
};

export const calculateSIF = (wallThickness_in, bendRadius_in, meanRadius_in) => {
  const h = (wallThickness_in * bendRadius_in) / (meanRadius_in * meanRadius_in);
  // i = 0.9 / h^(2/3) (must be >= 1.0)
  const i = Math.max(0.9 / Math.pow(h, 2 / 3.0), 1.0);
  return i;
};

export const solveSIF = (payload) => {
  const { nodes, schedules } = payload;
  const results = {};

  if (!nodes) return results;

  for (const node of nodes) {
    if (node.type === 'bend') {
      const schedData = schedules[node.nps]?.[node.schedule];
      if (!schedData) {
         throw new Error(`Schedule ${node.nps} ${node.schedule} not found for node ${node.id}`);
      }

      // Assume 1.5D bend radius (Long Radius elbow) for now if not provided
      // Bend radius = 1.5 * Nominal Pipe Size
      const bendRadius_in = 1.5 * parseFloat(node.nps);

      const k = calculateFlexibilityFactor(schedData.wallThickness_in, bendRadius_in, schedData.meanRadius_in);
      const i = calculateSIF(schedData.wallThickness_in, bendRadius_in, schedData.meanRadius_in);

      results[node.id] = {
        h_factor: (schedData.wallThickness_in * bendRadius_in) / (schedData.meanRadius_in * schedData.meanRadius_in),
        k_factor: k,
        sif: i,
      };
    }
  }

  return results;
};
