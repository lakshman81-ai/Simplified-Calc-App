export const calculateGCMForce = (modulusOfElasticity_psi, momentOfInertia_in4, length_in, expansion_in) => {
  // F = (12 * E * I * \Delta) / L^3
  return (12 * modulusOfElasticity_psi * momentOfInertia_in4 * expansion_in) / Math.pow(length_in, 3);
};

export const calculateBendingStress = (force_lbf, length_in, sectionModulus_in3, sif) => {
  // S_b = (M * i) / Z
  // M = F * L
  const moment_in_lbf = force_lbf * length_in;
  return (moment_in_lbf * sif) / sectionModulus_in3;
};

export const solveGuidedCantilever = (payload, thermalResults, sifResults) => {
  const { nodes, materials, schedules } = payload;
  const results = {};

  if (!nodes || nodes.length < 3) return results;

  // Simple L-bend implementation for now
  // We need to find L-bends (Node - Bend - Node)
  for (let i = 1; i < nodes.length - 1; i++) {
    const nodePrev = nodes[i - 1];
    const nodeCurr = nodes[i];
    const nodeNext = nodes[i + 1];

    if (nodeCurr.type === 'bend') {
      const seg1_key = `${nodePrev.id}-${nodeCurr.id}`;
      const seg2_key = `${nodeCurr.id}-${nodeNext.id}`;

      const seg1_thermal = thermalResults[seg1_key];
      const seg2_thermal = thermalResults[seg2_key];

      if (!seg1_thermal || !seg2_thermal) continue;

      const mat = materials[nodeCurr.materialId];
      const sched = schedules[nodeCurr.nps]?.[nodeCurr.schedule];

      if (!mat || !sched) continue;

      // The expansion of leg 1 is absorbed by leg 2 acting as a cantilever
      const F2 = calculateGCMForce(mat.elasticModulus_psi, sched.momentOfInertia_in4, seg2_thermal.length_in, seg1_thermal.expansion_in);

      // The expansion of leg 2 is absorbed by leg 1 acting as a cantilever
      const F1 = calculateGCMForce(mat.elasticModulus_psi, sched.momentOfInertia_in4, seg1_thermal.length_in, seg2_thermal.expansion_in);

      const nodeSif = sifResults[nodeCurr.id]?.sif || 1.0;

      const S_b1 = calculateBendingStress(F2, seg2_thermal.length_in, sched.sectionModulus_in3, nodeSif);
      const S_b2 = calculateBendingStress(F1, seg1_thermal.length_in, sched.sectionModulus_in3, nodeSif);

      const max_stress = Math.max(S_b1, S_b2);

      const allowable_stress = mat.allowableCold_psi + mat.allowableHot_psi; // Simplified range SA = 1.0(Sc + Sh)
      const ratio = max_stress / allowable_stress;

      results[nodeCurr.id] = {
        force_leg1_absorbs_leg2_lbf: F1,
        force_leg2_absorbs_leg1_lbf: F2,
        stress_leg1_psi: S_b1,
        stress_leg2_psi: S_b2,
        max_stress_psi: max_stress,
        allowable_stress_psi: allowable_stress,
        utilization_ratio: ratio,
      };
    }
  }

  return results;
};
