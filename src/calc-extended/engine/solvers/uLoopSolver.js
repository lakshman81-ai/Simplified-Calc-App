import { calculateDistance } from '../utils';

export const solveULoop = (payload, properties, log) => {
  log('Executing U-Loop independent solver module.');
  const { nodes, elements } = payload;
  const { E, I, tempDiff, alpha, SA, i, c } = properties;

  const n1 = nodes[0], n2 = nodes[1], n3 = nodes[2], n4 = nodes[3], n5 = nodes[4], n6 = nodes[5];
  const L1 = calculateDistance(n1, n2);
  const W1 = calculateDistance(n2, n3);
  const H = calculateDistance(n3, n4);
  const W2 = calculateDistance(n4, n5);
  const L2 = calculateDistance(n5, n6);

  // Main run expansion to be absorbed by the loop
  const deltaRun = (L1 + L2) * alpha * tempDiff;

  const L_absorb_effective = W1; // Simplified: Assuming symmetry W1=W2
  const delta_per_side = deltaRun / 2;

  const M_loop = (6 * E * I * delta_per_side) / Math.pow(L_absorb_effective, 2);
  const P_loop = (12 * E * I * delta_per_side) / Math.pow(L_absorb_effective, 3);

  const stress_loop = ((M_loop * c) / I) * i;
  const maxStress = stress_loop;

  const nodeResults = {
    [n1.id]: { forces: { P: P_loop }, moments: { M: M_loop } },
    [n6.id]: { forces: { P: P_loop }, moments: { M: M_loop } }
  };

  const elementResults = {};
  elements.forEach(el => {
    elementResults[el.id] = { stress: maxStress, ratio: maxStress / SA };
  });

  return { nodeResults, elementResults, maxStress };
};
