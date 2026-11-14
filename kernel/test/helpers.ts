import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function makePlot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "garden-test-"));
  fs.mkdirSync(path.join(root, ".garden"), { recursive: true });
  return root;
}

export function writeFile(
  root: string,
  relative: string,
  content: string,
): string {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  return file;
}

export function cleanup(root: string): void {
  fs.rmSync(root, { recursive: true, force: true });
}

export function baseConfig(): string {
  return `[plot]
name = "test"
version = "0.1.0"

[enforcement]
required = "advisory"

[adapters.pi]
enabled = true
model_aliases = { cheap = "pi-cheap", strong = "pi-strong" }

[adapters.claude]
enabled = true
model_aliases = { cheap = "haiku", strong = "sonnet" }

[gates]
require_stake = true
protect_garden = true
`;
}
