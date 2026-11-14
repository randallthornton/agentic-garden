import assert from "node:assert/strict";
import test from "node:test";
import { checkPreTool } from "../src/core/gates.js";
import { createLease } from "../src/core/leases.js";
import { baseConfig, cleanup, makePlot, writeFile } from "./helpers.js";

test("allows writes inside an active lease and blocks writes outside it", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/garden.toml", baseConfig());
    writeFile(
      root,
      ".garden/stakes/T-1.md",
      `---
ticket: T-1
act: grow
stage: first-fruit
bed: src/auth
paths: [src/auth]
---

# T-1
`,
    );

    createLease(root, {
      bed: "src/auth",
      ticket: "T-1",
      stake: "stakes/T-1.md",
    });

    const inside = checkPreTool(root, {
      tool: "write",
      path: "src/auth/session.ts",
    });
    assert.equal(inside.allowed, true);
    assert.equal(inside.lease?.bed, "src/auth");

    const outside = checkPreTool(root, {
      tool: "write",
      path: "src/billing/invoice.ts",
    });
    assert.equal(outside.allowed, false);
    assert.match(outside.reason ?? "", /No active lease covers/);
  } finally {
    cleanup(root);
  }
});

test("protects the plot directory from leaf writes", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/garden.toml", baseConfig());

    const result = checkPreTool(root, {
      tool: "write",
      path: ".garden/journal/plant.jsonl",
    });
    assert.equal(result.allowed, false);
    assert.match(result.reason ?? "", /protected/);
  } finally {
    cleanup(root);
  }
});
