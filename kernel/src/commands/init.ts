import fs from "node:fs";
import path from "node:path";
import { gardenDir, gardenFile } from "../core/paths.js";
import { TEMPLATES } from "../templates.js";

export interface InitResult {
  created: string[];
  skipped: string[];
}

export function runInit(root: string, options: { force?: boolean } = {}): InitResult {
  const created: string[] = [];
  const skipped: string[] = [];

  fs.mkdirSync(gardenDir(root), { recursive: true });

  for (const [relative, content] of Object.entries(TEMPLATES)) {
    const file = path.join(gardenDir(root), relative);

    if (fs.existsSync(file) && !options.force) {
      skipped.push(relative);
      continue;
    }

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");
    created.push(relative);
  }

  for (const dir of ["stakes", "journal", "leases", "almanac"]) {
    fs.mkdirSync(gardenFile(root, dir), { recursive: true });
    const keep = gardenFile(root, dir, ".gitkeep");
    if (!fs.existsSync(keep)) {
      fs.writeFileSync(keep, "", "utf8");
      created.push(`${dir}/.gitkeep`);
    }
  }

  return { created, skipped };
}
