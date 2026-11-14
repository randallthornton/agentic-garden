import { z } from "zod";

export const Lease = z.object({
  bed: z.string().min(1),
  ticket: z.string().min(1),
  stake: z.string().min(1),
  paths: z.array(z.string()).min(1),
  created: z.string().min(1),
  expires: z.string().min(1),
});
export type Lease = z.infer<typeof Lease>;
