import { checkPreTool } from "../core/gates.js";

export interface GatePreToolOptions {
  tool: string;
  path?: string;
  command?: string;
}

export function gatePreTool(root: string, options: GatePreToolOptions): number {
  const result = checkPreTool(root, {
    tool: options.tool,
    path: options.path,
    command: options.command,
  });

  if (result.allowed) {
    const lease = result.lease ? ` lease=${result.lease.bed}` : "";
    console.log(`allow (${result.level})${lease}`);
    return 0;
  }

  console.error(`block (${result.level}): ${result.reason}`);
  return 2;
}
