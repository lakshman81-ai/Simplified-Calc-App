import expansionDB from '../db/expansion_coefficients.json';
import modulusDB from '../db/modulus_elasticity.json';
import pipePropsDB from '../db/pipe_properties.json';
import { z } from 'zod';

const PayloadSchema = z.object({
  material: z.string(),
  nominalSize: z.number().positive(),
  schedule: z.string(),
  tempOperate: z.number(),
  tempInstall: z.number(),
  equipMaterial: z.enum(['Steel', 'Cast Iron']),
  boundaryMovement: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  vectors: z.array(z.object({ x: z.number(), y: z.number(), z: z.number(), len: z.number(), dir: z.string() }))
});

const interpolate = (val, x1, y1, x2, y2) => y1 + ((val - x1) * (y2 - y1)) / (x2 - x1);

const lookupValue = (db, material, temp, valueKey) => {
  const matData = db.find(d => d.material === material);
  if (!matData) return null;
  const data = matData.data;

  const exact = data.find(d => d.temp_F === temp);
  if (exact) return exact[valueKey];

  const lower = [...data].reverse().find(d => d.temp_F < temp);
  const upper = data.find(d => d.temp_F > temp);

  if (!lower) return upper ? upper[valueKey] : data[0][valueKey];
  if (!upper) return lower ? lower[valueKey] : data[data.length-1][valueKey];

  return interpolate(temp, lower.temp_F, lower[valueKey], upper.temp_F, upper[valueKey]);
};

export const solveStressAndForce = (rawPayload) => {
  const payload = PayloadSchema.parse(rawPayload);
  const { material, nominalSize, schedule, tempOperate, equipMaterial, boundaryMovement, vectors } = payload;

  const e_per_100ft = lookupValue(expansionDB, material, tempOperate, 'expansion_in_per_100ft');
  const e = e_per_100ft / 100; // in/ft

  const E_ksi = lookupValue(modulusDB, material, tempOperate, 'modulus_ksi');
  const E = E_ksi * 1000000; // PSI

  const pipe = pipePropsDB.find(p => p.nominal_size === nominalSize && p.schedule === schedule);
  const D = pipe.OD, I = pipe.I;

  let xNet = 0, yNet = 0, zNet = 0;
  let lenX = 0, lenY = 0, lenZ = 0;
  let shortDrops = 0;

  vectors.forEach(v => {
    xNet += v.x; yNet += v.y; zNet += v.z;
    if (Math.abs(v.x) > 0) lenX += Math.abs(v.x);
    if (Math.abs(v.y) > 0) lenY += Math.abs(v.y);
    if (Math.abs(v.z) > 0) {
      if (Math.abs(v.z) <= 3.0) shortDrops++;
      else lenZ += Math.abs(v.z);
    }
  });

  const deltaX = (Math.abs(xNet) * e) + boundaryMovement.x;
  const deltaY = (Math.abs(yNet) * e) + boundaryMovement.y;
  const deltaZ = (Math.abs(zNet) * e) + boundaryMovement.z;

  const bX = lenY + lenZ, bY = lenX + lenZ, bZ = lenX + lenY;

  const maxForce = equipMaterial === 'Steel' ? Math.min(200 * nominalSize, 2000) : Math.min(50 * nominalSize, 500);
  const maxStress = 20000;

  const calc = (delta, B) => {
    if (B === 0 || delta === 0) return { force: 0, stress: 0, status: 'PASS' };
    const force = (3 * E * I * delta) / (144 * Math.pow(B, 3));
    const stress = (3 * E * D * delta) / (144 * Math.pow(B, 2));
    const status = force > maxForce || stress > maxStress ? 'FAIL' : 'PASS';
    return { force: Math.round(force), stress: Math.round(stress), status };
  };

  return {
    X: { netDiff: Math.abs(xNet), bendingLeg: bX, freeExp: deltaX, ...calc(deltaX, bX) },
    Y: { netDiff: Math.abs(yNet), bendingLeg: bY, freeExp: deltaY, ...calc(deltaY, bY) },
    Z: { netDiff: Math.abs(zNet), bendingLeg: bZ, freeExp: deltaZ, ...calc(deltaZ, bZ) },
    maxForce, maxStress, shortDrops
  };
};