import { z } from "zod";
import { Act } from "./stake.js";
import { GrowthStage } from "./packet.js";

const Base = {
  ts: z.string().min(1),
  plant: z.string().min(1),
};

export const JournalRecord = z.discriminatedUnion("type", [
  z.object({
    ...Base,
    type: z.literal("classify"),
    ticket: z.string().min(1),
    act: Act,
    stage: GrowthStage,
    bed: z.string().min(1),
    stake: z.string().optional(),
  }),
  z.object({
    ...Base,
    type: z.literal("dispatch"),
    ticket: z.string().min(1),
    bed: z.string().min(1),
    lease: z.string().min(1),
  }),
  z.object({
    ...Base,
    type: z.literal("harvest"),
    ticket: z.string().min(1),
    checks: z.object({
      soundness: z.boolean(),
      fit: z.boolean(),
      value: z.boolean(),
    }),
  }),
  z.object({
    ...Base,
    type: z.literal("compost"),
    failure: z.string().min(1),
    rule: z.string().min(1),
  }),
]);
export type JournalRecord = z.infer<typeof JournalRecord>;
