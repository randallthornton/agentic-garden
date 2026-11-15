import * as semver from "semver";
import { z } from "zod";

export const PacketKind = z.enum(["seed", "graft"]);
export type PacketKind = z.infer<typeof PacketKind>;

export const PacketScope = z.enum(["modular-monolith", "microservice"]);
export type PacketScope = z.infer<typeof PacketScope>;

export const GrowthStage = z.enum([
  "seedling",
  "first-fruit",
  "full-bearing",
  "senescent",
  "composted",
]);
export type GrowthStage = z.infer<typeof GrowthStage>;

export const PacketMeta = z.object({
  kind: PacketKind,
  name: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "packet name must be kebab-case"),
  version: z
    .string()
    .refine((value) => semver.valid(value) !== null, "version must be valid semver"),
  requires: z.array(z.string()).default([]),
  scope: PacketScope.optional(),
  stage: GrowthStage.default("seedling"),
  genetics: z.array(z.string()).default([]),
  feed: z.array(z.string()).default([]),
  soundness: z.string().optional(),
  fit: z.string().optional(),
  value: z.string().optional(),
});
export type PacketMeta = z.infer<typeof PacketMeta>;

export interface Packet {
  meta: PacketMeta;
  body: string;
  file: string;
  relFile: string;
}
