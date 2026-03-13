import expansionCoeffs from '../db/expansion_coefficients.json';
import modulusElasticity from '../db/modulus_elasticity.json';
import pipeProps from '../db/pipe_properties.json';

// DB Lookups with Interpolation
const interpolateDB = (data, temp, valueKey) => {
  const sorted = [...data].sort((a, b) => a.temp_F - b.temp_F);
  if (temp <= sorted[0].temp_F) return sorted[0][valueKey];
  if (temp >= sorted[sorted.length - 1].temp_F) return sorted[sorted.length - 1][valueKey];

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (temp >= p1.temp_F && temp <= p2.temp_F) {
      const ratio = (temp - p1.temp_F) / (p2.temp_F - p1.temp_F);
      return p1[valueKey] + ratio * (p2[valueKey] - p1[valueKey]);
    }
  }
};

const getMaterialProps = (material, temp) => {
  const expMat = expansionCoeffs.find(m => m.material === material) || expansionCoeffs[0];
  const e_chart = interpolateDB(expMat.data, temp, 'expansion_in_per_100ft');

  const modMat = modulusElasticity.find(m => m.material === material) || modulusElasticity[0];
  const E_chart = interpolateDB(modMat.data, temp, 'modulus_ksi');

  return { e: e_chart / 100, E: E_chart * 1000000 };
};

const getPipeProps = (size, schedule) => {
  return pipeProps.find(p => p.nominal_size === size && p.schedule === schedule) || pipeProps[0];
};

// Geometry Parsing & Filtering Short Drops (Rule of Rigidity)
const parseGeometry = (nodes, segments, anchor1Id, anchor2Id) => {
  const n1 = nodes.find(n => n.id === anchor1Id);
  const n2 = nodes.find(n => n.id === anchor2Id);
  if (!n1 || !n2) throw new Error("Anchors not found in nodes");

  const diffX = n2.x - n1.x;
  const diffY = n2.y - n1.y;
  const diffZ = n2.z - n1.z;

  let bX = 0, bY = 0, bZ = 0;
  let shortDropsIgnored = 0;

  segments.forEach(seg => {
    const s1 = nodes.find(n => n.id === seg.startNodeId);
    const s2 = nodes.find(n => n.id === seg.endNodeId);
    if (!s1 || !s2) return;

    const dx = Math.abs(s2.x - s1.x);
    const dy = Math.abs(s2.y - s1.y);
    const dz = Math.abs(s2.z - s1.z);

    // Rule: Filter out Z-axis drops <= 3 ft
    if (dz > 0 && dx === 0 && dy === 0 && dz <= 3) {
      shortDropsIgnored++;
      return; // Ignore this segment for flexibility
    }

    bX += dy + dz; // Y and Z are perp to X
    bY += dx + dz; // X and Z are perp to Y
    bZ += dx + dy; // X and Y are perp to Z
  });

  return {
    netDiff: { x: diffX, y: diffY, z: diffZ },
    bendingLegs: { x: bX, y: bY, z: bZ },
    shortDropsIgnored
  };
};

// Guided Cantilever Approximation Solver
export const runExtendedSolver = (payload) => {
  const { nodes, segments, anchors, inputs, boundaryMovement, constraints } = payload;
  const { material, pipeSize, schedule, tOperate } = inputs;

  const { e, E } = getMaterialProps(material, tOperate);
  const pipe = getPipeProps(pipeSize, schedule);
  const { I, OD } = pipe;

  const { netDiff, bendingLegs, shortDropsIgnored } = parseGeometry(nodes, segments, anchors.anchor1, anchors.anchor2);

  const calcAxis = (axis, net, bendLeg, boundMovement) => {
    // Delta = (Net Diff * e) + boundary movement offset
    const delta = (Math.abs(net) * e) + (boundMovement || 0);

    // P = 3EIΔ / 144B³
    const force = bendLeg > 0 ? (3 * E * I * delta) / (144 * Math.pow(bendLeg, 3)) : 0;

    // Sb = 3EDΔ / 144B²
    const stress = bendLeg > 0 ? (3 * E * OD * delta) / (144 * Math.pow(bendLeg, 2)) : 0;

    const maxForce = constraints.equipmentMaterial === 'Steel' ? Math.min(200 * pipeSize, 2000) : Math.min(50 * pipeSize, 500);
    const maxStress = constraints.maxStress; // Default 20000

    const status = (force <= maxForce && stress <= maxStress) ? 'PASS' : 'FAIL';

    return { netDiff: Math.abs(net), bendingLeg: bendLeg, delta, force, stress, maxForce, maxStress, status };
  };

  const xRes = calcAxis('X', netDiff.x, bendingLegs.x, boundaryMovement.x);
  const yRes = calcAxis('Y', netDiff.y, bendingLegs.y, boundaryMovement.y);
  const zRes = calcAxis('Z', netDiff.z, bendingLegs.z, boundaryMovement.z);

  return {
    axes: { X: xRes, Y: yRes, Z: zRes },
    meta: { shortDropsIgnored, e, E, I, OD, pipeSize, maxForceEq: constraints.equipmentMaterial }
  };
};
