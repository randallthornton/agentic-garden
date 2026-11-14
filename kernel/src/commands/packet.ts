import {
  listPackets,
  resolvePacket,
  validatePackets,
} from "../core/packets.js";
import { PacketKind } from "../schemas/packet.js";

export function packetList(root: string, kind?: PacketKind): void {
  const packets = listPackets(root, kind);

  if (packets.length === 0) {
    console.log("No packets found.");
    return;
  }

  for (const packet of packets) {
    console.log(
      `${packet.meta.kind.padEnd(5)} ${packet.meta.name}@${packet.meta.version}  stage=${packet.meta.stage}  ${packet.relFile}`,
    );
  }
}

export function packetRead(root: string, spec: string, kind?: PacketKind): void {
  const packet = resolvePacket(root, spec, kind);
  console.log(packet.relFile);
  console.log(JSON.stringify(packet.meta, null, 2));
  console.log("");
  console.log(packet.body);
}

export function packetCheck(root: string): number {
  const { errors, warnings } = validatePackets(root);

  for (const warning of warnings) {
    console.warn(`warn: ${warning}`);
  }
  for (const error of errors) {
    console.error(`error: ${error}`);
  }

  if (errors.length === 0) {
    console.log("ok: packet bank is consistent");
  }

  return errors.length > 0 ? 1 : 0;
}
