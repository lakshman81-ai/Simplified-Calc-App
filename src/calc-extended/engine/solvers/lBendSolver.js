import { calculateDistance } from '../utils';

export const solveLBend = (payload, properties, log) => {
  log('Executing L-Bend independent solver module.');
  const { nodes, elements } = payload;
  const { E, I, tempDiff, alpha, SA, i, c } = properties;

  const n1 = nodes[0], n2 = nodes[1], n3 = nodes[2];
  const L1 = calculateDistance(n1, n2);
  const L2 = calculateDistance(n2, n3);

  const delta1 = L1 * alpha * tempDiff;
  const delta2 = L2 * alpha * tempDiff;

  const M1 = (6 * E * I * delta2) / Math.pow(L1, 2);
  const M2 = (6 * E * I * delta1) / Math.pow(L2, 2);

  const P1 = (12 * E * I * delta2) / Math.pow(L1, 3);
  const P2 = (12 * E * I * delta1) / Math.pow(L2, 3);

  const Sb1 = (M1 * c) / I;
  const Sb2 = (M2 * c) / I;

  const stress1 = Sb1 * i;
  const stress2 = Sb2 * i;

  const maxStress = Math.max(stress1, stress2);

  const nodeResults = {
    [n1.id]: { forces: { P: P1 }, moments: { M: M1 } },
    [n3.id]: { forces: { P: P2 }, moments: { M: M2 } }
  };

  const elementResults = {
    [elements[0].id]: { stress: maxStress, ratio: maxStress / SA },
    [elements[1].id]: { stress: maxStress, ratio: maxStress / SA }
  };

  return { nodeResults, elementResults, maxStress };
};
