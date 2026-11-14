import { z } from "zod";

export const EnforcementLevel = z.enum([
  "advisory",
  "hooked",
  "orchestrated",
  "groundskeeper",
]);
export type EnforcementLevel = z.infer<typeof EnforcementLevel>;

export const AdapterConfig = z.object({
  enabled: z.boolean().default(true),
  model_aliases: z.record(z.string(), z.string()).default({}),
});
export type AdapterConfig = z.infer<typeof AdapterConfig>;

export const GatesConfig = z.object({
  require_stake: z.boolean().default(true),
  protect_garden: z.boolean().default(true),
  allow_bash: z.array(z.string()).default([]),
});
export type GatesConfig = z.infer<typeof GatesConfig>;

export const GardenConfig = z.object({
  plot: z.object({
    name: z.string(),
    version: z.string().default("0.1.0"),
  }),
  enforcement: z
    .object({
      required: EnforcementLevel.default("advisory"),
    })
    .default({ required: "advisory" }),
  adapters: z
    .object({
      pi: AdapterConfig.optional(),
      claude: AdapterConfig.optional(),
    })
    .default({}),
  gates: GatesConfig.default({
    require_stake: true,
    protect_garden: true,
    allow_bash: [],
  }),
});
export type GardenConfig = z.infer<typeof GardenConfig>;
