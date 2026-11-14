import fs from "node:fs";
import path from "node:path";
import { JournalRecord } from "../schemas/journal.js";
import { gardenFile, sanitizeName } from "./paths.js";

export function journalDir(root: string): string {
  return gardenFile(root, "journal");
}

export function journalFile(root: string, plant: string): string {
  return path.join(journalDir(root), `${sanitizeName(plant)}.jsonl`);
}

export function appendJournal(
  root: string,
  plant: string,
  record: unknown,
): JournalRecord {
  const parsed = JournalRecord.parse(record);
  const file = journalFile(root, plant);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(parsed)}\n`, "utf8");
  return parsed;
}

export function readJournal(root: string, plant: string): JournalRecord[] {
  const file = journalFile(root, plant);
  if (!fs.existsSync(file)) return [];

  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JournalRecord.parse(JSON.parse(line));
      } catch (error) {
        throw new Error(
          `${file}:${index + 1}: invalid journal record (${(error as Error).message})`,
        );
      }
    });
}

export function listPlants(root: string): string[] {
  const dir = journalDir(root);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl"))
    .map((entry) => entry.name.replace(/\.jsonl$/, ""))
    .sort();
}
