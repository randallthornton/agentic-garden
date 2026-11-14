import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { runInit } from "../src/commands/init.js";
import { cleanup, makePlot } from "./helpers.js";

test("init scaffolds a garden and is idempotent", () => {
  const root = makePlot();
  try {
    const first = runInit(root);
    assert.ok(first.created.includes("garden.toml"));
    assert.ok(fs.existsSync(path.join(root, ".garden", "agents", "assistant.md")));
    assert.ok(fs.existsSync(path.join(root, ".garden", "seeds", "example", "0.1.0", "PACKET.md")));

    const second = runInit(root);
    assert.equal(second.created.length, 0);
    assert.ok(second.skipped.length > 0);
  } finally {
    cleanup(root);
  }
});
