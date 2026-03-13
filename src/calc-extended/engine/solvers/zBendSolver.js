import { calculateDistance } from '../utils';

export const solveZBend = (payload, properties, log) => {
  log('Executing Z-Bend independent solver module.');
  const { nodes, elements } = payload;
  const { E, I, tempDiff, alpha, SA, i, c } = properties;

  const n1 = nodes[0], n2 = nodes[1], n3 = nodes[2], n4 = nodes[3];
  const L1 = calculateDistance(n1, n2); // Outer 1
  const L2 = calculateDistance(n2, n3); // Middle (Offset)
  const L3 = calculateDistance(n3, n4); // Outer 2

  const delta1 = L1 * alpha * tempDiff;
  const delta2 = L2 * alpha * tempDiff;
  const delta3 = L3 * alpha * tempDiff;

  // The offset leg L2 absorbs (delta1 + delta3)
  const totalDeltaOuter = delta1 + delta3;

  // Middle leg bends
  const M_mid = (6 * E * I * totalDeltaOuter) / Math.pow(L2, 2);
  const P_mid = (12 * E * I * totalDeltaOuter) / Math.pow(L2, 3);

  // Outer legs bend due to delta2
  const M_out1 = (6 * E * I * delta2) / Math.pow(L1, 2);
  const M_out2 = (6 * E * I * delta2) / Math.pow(L3, 2);

  const P_out1 = (12 * E * I * delta2) / Math.pow(L1, 3);
  const P_out2 = (12 * E * I * delta2) / Math.pow(L3, 3);

  const stress_mid = ((M_mid * c) / I) * i;
  const stress_out1 = ((M_out1 * c) / I) * i;
  const stress_out2 = ((M_out2 * c) / I) * i;

  const maxStress = Math.max(stress_mid, stress_out1, stress_out2);

  const nodeResults = {
    [n1.id]: { forces: { P: P_out1 }, moments: { M: M_out1 } },
    [n4.id]: { forces: { P: P_out2 }, moments: { M: M_out2 } }
  };

  const elementResults = {
    [elements[0].id]: { stress: maxStress, ratio: maxStress / SA },
    [elements[1].id]: { stress: maxStress, ratio: maxStress / SA },
    [elements[2].id]: { stress: maxStress, ratio: maxStress / SA }
  };

  return { nodeResults, elementResults, maxStress };
};
