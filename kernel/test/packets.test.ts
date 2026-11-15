import assert from "node:assert/strict";
import test from "node:test";
import { listPackets, resolvePacket, validatePackets } from "../src/core/packets.js";
import { cleanup, makePlot, writeFile } from "./helpers.js";

function seed(name: string, version: string): string {
  return `---
kind: seed
name: ${name}
version: ${version}
stage: first-fruit
---

# ${name} ${version}
`;
}

test("resolves the highest packet matching a semver range", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/seeds/foo/1.0.0/PACKET.md", seed("foo", "1.0.0"));
    writeFile(root, ".garden/seeds/foo/1.2.0/PACKET.md", seed("foo", "1.2.0"));
    writeFile(root, ".garden/seeds/foo/2.0.0/PACKET.md", seed("foo", "2.0.0"));

    const packet = resolvePacket(root, "foo@^1.0.0");
    assert.equal(packet.meta.version, "1.2.0");
    assert.equal(listPackets(root).length, 3);
  } finally {
    cleanup(root);
  }
});

test("reads the declared packet scope", () => {
  const root = makePlot();
  try {
    writeFile(
      root,
      ".garden/seeds/foo/1.0.0/PACKET.md",
      `---
kind: seed
name: foo
version: 1.0.0
scope: modular-monolith
---

# foo
`,
    );

    const packet = resolvePacket(root, "foo");
    assert.equal(packet.meta.scope, "modular-monolith");
  } finally {
    cleanup(root);
  }
});

test("validates a graft against the seed bank", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/seeds/aspnet-api/1.2.0/PACKET.md", seed("aspnet-api", "1.2.0"));
    writeFile(
      root,
      ".garden/grafts/stripe-union/0.3.1/PACKET.md",
      `---
kind: graft
name: stripe-union
version: 0.3.1
requires: ["aspnet-api@^1.2.0"]
---

# Stripe union
`,
    );

    const report = validatePackets(root);
    assert.deepEqual(report.errors, []);
  } finally {
    cleanup(root);
  }
});

test("reports a graft whose seed requirement is unsatisfied", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/seeds/aspnet-api/1.2.0/PACKET.md", seed("aspnet-api", "1.2.0"));
    writeFile(
      root,
      ".garden/grafts/stripe-union/0.3.1/PACKET.md",
      `---
kind: graft
name: stripe-union
version: 0.3.1
requires: ["aspnet-api@^2.0.0"]
---

# Stripe union
`,
    );

    const report = validatePackets(root);
    assert.equal(report.errors.length, 1);
    assert.match(report.errors[0], /no seed packet satisfies/);
  } finally {
    cleanup(root);
  }
});
