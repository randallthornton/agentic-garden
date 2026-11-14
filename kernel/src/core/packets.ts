import fs from "node:fs";
import path from "node:path";
import * as semver from "semver";
import { Packet, PacketKind, PacketMeta } from "../schemas/packet.js";
import { parseFrontmatter } from "./frontmatter.js";
import { gardenFile, toPosix } from "./paths.js";

export function packetKindDir(root: string, kind: PacketKind): string {
  return gardenFile(root, kind === "seed" ? "seeds" : "grafts");
}

export function parsePacket(root: string, file: string): Packet {
  const text = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(text);
  const meta = PacketMeta.parse(data);
  return {
    meta,
    body,
    file,
    relFile: toPosix(path.relative(root, file)),
  };
}

export function listPackets(root: string, kind?: PacketKind): Packet[] {
  const kinds: PacketKind[] = kind ? [kind] : ["seed", "graft"];
  const packets: Packet[] = [];

  for (const currentKind of kinds) {
    const kindDir = packetKindDir(root, currentKind);
    if (!fs.existsSync(kindDir)) continue;

    for (const nameEntry of fs.readdirSync(kindDir, { withFileTypes: true })) {
      if (!nameEntry.isDirectory()) continue;
      const nameDir = path.join(kindDir, nameEntry.name);

      for (const versionEntry of fs.readdirSync(nameDir, { withFileTypes: true })) {
        if (!versionEntry.isDirectory()) continue;
        const file = path.join(nameDir, versionEntry.name, "PACKET.md");
        if (!fs.existsSync(file)) continue;
        packets.push(parsePacket(root, file));
      }
    }
  }

  return packets;
}

export function parsePacketSpec(spec: string): { name: string; range: string } {
  const at = spec.lastIndexOf("@");
  if (at === -1) return { name: spec, range: "*" };
  return { name: spec.slice(0, at), range: spec.slice(at + 1) };
}

export function resolvePacket(root: string, spec: string, kind?: PacketKind): Packet {
  const { name, range } = parsePacketSpec(spec);
  if (semver.validRange(range) === null) {
    throw new Error(`Invalid version range in packet spec: ${spec}`);
  }

  const matches = listPackets(root, kind).filter(
    (packet) => packet.meta.name === name && semver.satisfies(packet.meta.version, range),
  );

  if (matches.length === 0) {
    throw new Error(`No packet matches ${spec}`);
  }

  return matches.sort((a, b) => semver.rcompare(a.meta.version, b.meta.version))[0];
}

export interface PacketValidation {
  errors: string[];
  warnings: string[];
}

export function validatePackets(root: string): PacketValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const packets = listPackets(root);
  const seen = new Set<string>();

  for (const packet of packets) {
    const key = `${packet.meta.kind}:${packet.meta.name}@${packet.meta.version}`;
    if (seen.has(key)) {
      errors.push(`Duplicate packet ${key}`);
    }
    seen.add(key);

    const directoryVersion = path.basename(path.dirname(packet.file));
    if (directoryVersion !== packet.meta.version) {
      errors.push(
        `${packet.relFile}: directory version ${directoryVersion} does not match packet version ${packet.meta.version}`,
      );
    }

    if (packet.meta.kind === "seed" && packet.meta.requires.length > 0) {
      errors.push(`${packet.relFile}: seed packets must not declare requires`);
    }

    if (packet.meta.kind === "graft" && packet.meta.requires.length === 0) {
      errors.push(`${packet.relFile}: graft packets must declare at least one seed requirement`);
    }

    for (const requirement of packet.meta.requires) {
      const parsed = parsePacketSpec(requirement);
      if (semver.validRange(parsed.range) === null) {
        errors.push(`${packet.relFile}: invalid requirement range ${requirement}`);
        continue;
      }
      const compatible = listPackets(root, "seed").some(
        (seed) =>
          seed.meta.name === parsed.name &&
          semver.satisfies(seed.meta.version, parsed.range),
      );
      if (!compatible) {
        errors.push(`${packet.relFile}: no seed packet satisfies ${requirement}`);
      }
    }
  }

  if (packets.length === 0) {
    warnings.push("No packets found in the seed bank");
  }

  return { errors, warnings };
}
