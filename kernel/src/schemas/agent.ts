import { z } from "zod";

export const CanonicalTool = z.enum([
  "read",
  "search",
  "glob",
  "list",
  "write",
  "edit",
  "bash",
  "dispatch",
]);
export type CanonicalTool = z.infer<typeof CanonicalTool>;

export const AgentMeta = z.object({
  name: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "agent name must be kebab-case"),
  description: z.string().min(1),
  tools: z.array(CanonicalTool).default([]),
  model: z.string().default("inherit"),
});
export type AgentMeta = z.infer<typeof AgentMeta>;

export interface Agent {
  meta: AgentMeta;
  body: string;
  file: string;
  relFile: string;
}
