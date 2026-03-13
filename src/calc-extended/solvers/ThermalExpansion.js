export const calculateThermalExpansion = (length_in, tempDelta_F, expansionCoefficient) => {
  // expansionCoefficient is typically in/100ft/°F. We need to convert it.
  // Standard conversion: total expansion = (L_ft / 100) * alpha * tempDelta
  // If length is in inches, length_ft = length_in / 12
  const length_ft = length_in / 12.0;
  const expansion_in = (length_ft / 100.0) * expansionCoefficient * tempDelta_F;
  return expansion_in;
};

export const solveThermal = (payload) => {
  const { nodes, materials } = payload;
  const results = {};

  if (!nodes || nodes.length < 2) return results;

  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i + 1];

    const dx = nodeB.x - nodeA.x;
    const dy = nodeB.y - nodeA.y;
    const dz = nodeB.z - nodeA.z;
    const length_in = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const mat = materials[nodeA.materialId];
    if (!mat) {
      throw new Error(`Material ${nodeA.materialId} not found`);
    }

    const expansion_in = calculateThermalExpansion(length_in, nodeA.tempDelta_F, mat.expansion_in_per_100ft_degF);

    results[`${nodeA.id}-${nodeB.id}`] = {
      length_in,
      expansion_in,
    };
  }

  return results;
};
