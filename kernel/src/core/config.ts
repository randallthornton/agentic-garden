import fs from "node:fs";
import { parse as parseToml } from "smol-toml";
import { GardenConfig } from "../schemas/config.js";
import { gardenFile } from "./paths.js";

export function configFile(root: string): string {
  return gardenFile(root, "garden.toml");
}

export function loadConfig(root: string): GardenConfig {
  const file = configFile(root);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}. Run \`garden init\` first.`);
  }
  const parsed = parseToml(fs.readFileSync(file, "utf8"));
  return GardenConfig.parse(parsed);
}
