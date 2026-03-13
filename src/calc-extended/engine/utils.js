import materialsDB from '../db/materials.json';
import pipeSchedulesDB from '../db/pipeSchedules.json';

export const calculateDistance = (n1, n2) => {
  return Math.sqrt(
    Math.pow(n2.x - n1.x, 2) +
    Math.pow(n2.y - n1.y, 2) +
    Math.pow(n2.z - n1.z, 2)
  );
};

export const validatePayload = (payload) => {
  if (!payload || !payload.systemParams || !payload.nodes || !payload.elements) {
    throw new Error('Invalid payload structure: Missing required fields.');
  }
  const { material, pipeSize, schedule } = payload.systemParams;
  if (!materialsDB[material]) {
    throw new Error(`Material ${material} not found in database.`);
  }
  if (!pipeSchedulesDB[pipeSize] || !pipeSchedulesDB[pipeSize][schedule]) {
    throw new Error(`Pipe size ${pipeSize} or schedule ${schedule} not found in database.`);
  }
};

export const getBaseProperties = (payload, config) => {
  const { systemParams } = payload;
  const materialProps = materialsDB[systemParams.material];
  const pipeProps = pipeSchedulesDB[systemParams.pipeSize];
  const scheduleProps = pipeProps[systemParams.schedule];

  const OD = pipeProps.outsideDiameter; // mm
  const wt = scheduleProps.wallThickness; // mm
  const ID = OD - 2 * wt;

  // Moment of inertia (I) = pi * (OD^4 - ID^4) / 64
  const I = (Math.PI / 64) * (Math.pow(OD, 4) - Math.pow(ID, 4)); // mm^4

  const globalTemp = config.globalTemperatureOverride;
  const tempDiff = (globalTemp !== null && globalTemp !== undefined ? globalTemp : systemParams.operatingTemp) - systemParams.ambientTemp;

  const E = materialProps.modulusOfElasticityHot; // MPa
  const alpha = materialProps.thermalExpansionCoeff;

  // Allowable stress
  const Sc = materialProps.allowableStressCold;
  const Sh = materialProps.allowableStressHot;
  const SA = 1.0 * (1.25 * Sc + 0.25 * Sh);

  // SIF
  const R = 1.5 * OD;
  const rm = (OD - wt) / 2;
  const h = (wt * R) / Math.pow(rm, 2);
  const SIF = 0.9 / Math.pow(h, 2/3);
  const i = Math.max(1.0, SIF);
  const c = OD / 2;

  return { OD, wt, ID, I, tempDiff, E, alpha, SA, SIF, i, c };
};
