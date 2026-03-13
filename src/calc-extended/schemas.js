import { z } from 'zod';

export const materialSchema = z.object({
  id: z.string(),
  name: z.string(),
  elasticModulus_psi: z.number().positive(),
  expansion_in_per_100ft_degF: z.number().positive(),
  allowableCold_psi: z.number().positive(),
  allowableHot_psi: z.number().positive(),
});

export const scheduleSchema = z.object({
  nps: z.string(),
  schedule: z.string(),
  outerDiameter_in: z.number().positive(),
  wallThickness_in: z.number().positive(),
  momentOfInertia_in4: z.number().positive(),
  sectionModulus_in3: z.number().positive(),
  meanRadius_in: z.number().positive(),
});

export const nodeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  type: z.enum(["anchor", "node", "bend"]),
  materialId: z.string(),
  nps: z.string(),
  schedule: z.string(),
  tempDelta_F: z.number(),
});

export const solverConfigSchema = z.object({
  useB313Legacy: z.boolean().default(true),
  applyStressRangeReduction: z.boolean().default(false),
  activeSolvers: z.array(z.enum(["thermal", "sif", "guided_cantilever"])).default(["thermal", "sif", "guided_cantilever"]),
});

export const systemPayloadSchema = z.object({
  nodes: z.array(nodeSchema),
  materials: z.record(z.string(), materialSchema),
  schedules: z.record(z.string(), z.record(z.string(), scheduleSchema)), // e.g. schedules["4"]["STD"]
  config: solverConfigSchema,
});
