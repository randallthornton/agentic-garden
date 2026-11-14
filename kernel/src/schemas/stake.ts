import { z } from "zod";
import { GrowthStage } from "./packet.js";

export const Act = z.enum(["sow", "grow", "graft", "mutate", "treat", "prune"]);
export type Act = z.infer<typeof Act>;

export const StakeMeta = z.object({
  ticket: z.string().min(1),
  act: Act,
  stage: GrowthStage,
  bed: z.string().min(1),
  paths: z.array(z.string()).default([]),
  acceptance: z.string().optional(),
});
export type StakeMeta = z.infer<typeof StakeMeta>;

export interface Stake {
  meta: StakeMeta;
  body: string;
  file: string;
  relFile: string;
}
