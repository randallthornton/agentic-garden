import fs from "node:fs";
import path from "node:path";
import { Lease } from "../schemas/lease.js";
import { gardenFile, isInside, normalizeRel, sanitizeName, toPosix } from "./paths.js";
import { readStake } from "./stakes.js";

export interface CreateLeaseInput {
  bed: string;
  ticket: string;
  stake: string;
  paths?: string[];
  ttl?: string;
}

export function leasesDir(root: string): string {
  return gardenFile(root, "leases");
}

export function leaseFile(root: string, bed: string): string {
  return path.join(leasesDir(root), `${sanitizeName(bed)}.json`);
}

export function parseDuration(value: string): number {
  const match = /^(\d+)(m|h|d)$/.exec(value);
  if (!match) {
    throw new Error(`Invalid duration: ${value}. Use a value like 30m, 2h, or 1d.`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return amount * multiplier;
}

function normalizeLeasePaths(root: string, paths: string[]): string[] {
  return paths.map((value) => {
    const rel = normalizeRel(root, value);
    const absolute = path.resolve(root, rel);
    if (!isInside(absolute, root)) {
      throw new Error(`Lease path escapes the plot: ${value}`);
    }
    return toPosix(rel);
  });
}

export function createLease(root: string, input: CreateLeaseInput): Lease {
  const stake = readStake(root, input.stake);
  const rawPaths =
    input.paths && input.paths.length > 0
      ? input.paths
      : stake.meta.paths.length > 0
        ? stake.meta.paths
        : [stake.meta.bed];

  const paths = normalizeLeasePaths(root, rawPaths);
  const created = new Date();
  const expires = new Date(created.getTime() + parseDuration(input.ttl ?? "2h"));

  const lease = Lease.parse({
    bed: input.bed,
    ticket: input.ticket,
    stake: input.stake,
    paths,
    created: created.toISOString(),
    expires: expires.toISOString(),
  });

  const file = leaseFile(root, input.bed);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(lease, null, 2)}\n`, "utf8");
  return lease;
}

export function readLease(root: string, bed: string): Lease {
  const file = leaseFile(root, bed);
  if (!fs.existsSync(file)) {
    throw new Error(`No lease for bed ${bed}`);
  }
  return Lease.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

export function listLeases(root: string): Lease[] {
  const dir = leasesDir(root);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => Lease.parse(JSON.parse(fs.readFileSync(path.join(dir, entry.name), "utf8"))))
    .sort((a, b) => a.bed.localeCompare(b.bed));
}

export function activeLeases(root: string, now = new Date()): Lease[] {
  return listLeases(root).filter((lease) => new Date(lease.expires).getTime() > now.getTime());
}

export function findLeaseForPath(root: string, filePath: string): Lease | undefined {
  const relative = normalizeRel(root, filePath);
  const absolute = path.resolve(root, relative);

  return activeLeases(root).find((lease) =>
    lease.paths.some((leasePath) =>
      isInside(absolute, path.resolve(root, leasePath)),
    ),
  );
}

export function clearLease(root: string, bed: string): boolean {
  const file = leaseFile(root, bed);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
