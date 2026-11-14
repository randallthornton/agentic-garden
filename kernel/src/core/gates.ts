import { EnforcementLevel, GardenConfig } from "../schemas/config.js";
import { Lease } from "../schemas/lease.js";
import { loadConfig } from "./config.js";
import { findLeaseForPath } from "./leases.js";
import { normalizeRel } from "./paths.js";

export interface PreToolInput {
  tool: string;
  path?: string;
  command?: string;
}

export interface GateResult {
  allowed: boolean;
  reason?: string;
  lease?: Lease;
  level: EnforcementLevel;
}

const MUTATING_TOOLS = new Set(["write", "edit"]);

/**
 * The hooked-tier gate. It is deliberately narrow for the first kernel:
 * write/edit calls require an active lease, and the plot itself is protected.
 * Bash mutation detection is left to the groundskeeper tier.
 */
export function checkPreTool(
  root: string,
  input: PreToolInput,
  config: GardenConfig = loadConfig(root),
): GateResult {
  const level: EnforcementLevel = "hooked";

  if (!MUTATING_TOOLS.has(input.tool)) {
    return { allowed: true, level };
  }

  if (!input.path) {
    return {
      allowed: false,
      reason: "A write or edit requires a path",
      level,
    };
  }

  const relative = normalizeRel(root, input.path);

  if (
    config.gates.protect_garden &&
    (relative === ".garden" || relative.startsWith(".garden/"))
  ) {
    return {
      allowed: false,
      reason: `${relative} is protected. Change the plot through garden commands.`,
      level,
    };
  }

  if (!config.gates.require_stake) {
    return { allowed: true, level };
  }

  const lease = findLeaseForPath(root, relative);
  if (!lease) {
    return {
      allowed: false,
      reason: `No active lease covers ${relative}. Create a stake and lease before writing.`,
      level,
    };
  }

  return { allowed: true, lease, level };
}
