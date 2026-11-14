import fs from "node:fs";
import path from "node:path";

export const GARDEN_DIR = ".garden";

export function findPlotRoot(start = process.cwd()): string {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, GARDEN_DIR))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        `No ${GARDEN_DIR} directory found. Run \`garden init\` first.`,
      );
    }
    dir = parent;
  }
}

export function gardenDir(root: string): string {
  return path.join(root, GARDEN_DIR);
}

export function gardenFile(root: string, ...parts: string[]): string {
  return path.join(gardenDir(root), ...parts);
}

export function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

export function normalizeRel(root: string, value: string): string {
  const absolute = path.isAbsolute(value) ? value : path.resolve(root, value);
  return toPosix(path.relative(root, absolute));
}

export function isInside(child: string, parent: string): boolean {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "unnamed";
}
