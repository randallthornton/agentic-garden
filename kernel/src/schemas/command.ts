import { z } from "zod";

export const CommandMeta = z.object({
  description: z.string().min(1),
  "argument-hint": z.string().optional(),
});
export type CommandMeta = z.infer<typeof CommandMeta>;

export interface Command {
  meta: CommandMeta;
  body: string;
  file: string;
  relFile: string;
  name: string;
}
