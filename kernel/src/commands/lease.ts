import {
  clearLease,
  createLease,
  listLeases,
  readLease,
} from "../core/leases.js";

export interface LeaseCreateOptions {
  bed: string;
  ticket: string;
  stake: string;
  paths?: string;
  ttl?: string;
}

export function leaseCreate(root: string, options: LeaseCreateOptions): void {
  const paths = options.paths
    ? options.paths
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  const lease = createLease(root, {
    bed: options.bed,
    ticket: options.ticket,
    stake: options.stake,
    paths,
    ttl: options.ttl,
  });

  console.log(JSON.stringify(lease, null, 2));
}

export function leaseList(root: string): void {
  const leases = listLeases(root);
  if (leases.length === 0) {
    console.log("No leases found.");
    return;
  }

  const now = Date.now();
  for (const lease of leases) {
    const expired = new Date(lease.expires).getTime() <= now;
    console.log(
      `${lease.bed.padEnd(24)} ${lease.ticket.padEnd(16)} ${expired ? "expired" : "active"}  ${lease.paths.join(", ")}`,
    );
  }
}

export function leaseShow(root: string, bed: string): void {
  console.log(JSON.stringify(readLease(root, bed), null, 2));
}

export function leaseClear(root: string, bed: string): void {
  const cleared = clearLease(root, bed);
  console.log(cleared ? `Cleared lease for ${bed}.` : `No lease for ${bed}.`);
}
