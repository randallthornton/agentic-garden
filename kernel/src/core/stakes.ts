import fs from "node:fs";
import path from "node:path";
import { Stake, StakeMeta } from "../schemas/stake.js";
import { parseFrontmatter } from "./frontmatter.js";
import { gardenDir, gardenFile, isInside, toPosix } from "./paths.js";

export function stakesDir(root: string): string {
  return gardenFile(root, "stakes");
}

export function parseStake(root: string, file: string): Stake {
  const text = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(text);
  const meta = StakeMeta.parse(data);
  return {
    meta,
    body,
    file,
    relFile: toPosix(path.relative(root, file)),
  };
}

export function listStakes(root: string): Stake[] {
  const dir = stakesDir(root);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => parseStake(root, path.join(dir, entry.name)));
}

export function readStake(root: string, relPath: string): Stake {
  const candidates = [
    path.resolve(gardenDir(root), relPath),
    path.resolve(root, relPath),
  ];
  const file = candidates.find((candidate) => fs.existsSync(candidate));

  if (!file) {
    throw new Error(`Stake not found: ${relPath}`);
  }

  if (!isInside(file, gardenDir(root)) && !isInside(file, root)) {
    throw new Error(`Stake path escapes the plot: ${relPath}`);
  }

  return parseStake(root, file);
}
