import { sync } from "../core/adapters.js";

export function syncCommand(root: string, options: { check?: boolean } = {}): number {
  const result = sync(root, { check: options.check });

  if (options.check) {
    if (result.drifted.length === 0) {
      console.log("Generated artifacts are up to date.");
      return 0;
    }

    console.error("Stale generated artifacts:");
    for (const file of result.drifted) {
      console.error(`  ${file}`);
    }
    return 1;
  }

  if (result.written.length === 0) {
    console.log("No adapters enabled; nothing generated.");
    return 0;
  }

  console.log(`Wrote ${result.written.length} generated artifact(s):`);
  for (const file of result.written) {
    console.log(`  ${file}`);
  }
  return 0;
}
