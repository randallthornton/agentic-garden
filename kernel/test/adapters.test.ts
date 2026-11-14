import assert from "node:assert/strict";
import test from "node:test";
import {
  generateClaude,
  generatePi,
  sync,
} from "../src/core/adapters.js";
import { baseConfig, cleanup, makePlot, writeFile } from "./helpers.js";

function agent(): string {
  return `---
name: grower
description: "Extends an existing plant: inherits its conventions."
tools: read, search, glob, list, write, edit, bash
model: strong
---

You are a leaf.
`;
}

function command(): string {
  return `---
description: Survey the plot
argument-hint: "[focus]"
---

Survey $ARGUMENTS.
`;
}

test("generates pi agents with mapped tools and model aliases", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/garden.toml", baseConfig());
    writeFile(root, ".garden/agents/grower.md", agent());
    writeFile(root, ".garden/commands/survey.md", command());

    const generated = generatePi(root);
    const grower = generated.get(".pi/agents/grower.md") ?? "";

    assert.match(grower, /tools: read, grep, find, ls, write, edit, bash/);
    assert.match(grower, /model: pi-strong/);
    assert.match(generated.get(".pi/prompts/survey.md") ?? "", /argument-hint/);
  } finally {
    cleanup(root);
  }
});

test("generates claude agents with deduplicated tool names", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/garden.toml", baseConfig());
    writeFile(root, ".garden/agents/grower.md", agent());

    const generated = generateClaude(root);
    const grower = generated.get(".claude/agents/grower.md") ?? "";

    assert.match(grower, /tools: Read, Grep, Glob, Write, Edit, Bash/);
    assert.match(grower, /model: sonnet/);
  } finally {
    cleanup(root);
  }
});

test("sync writes artifacts and detects drift", () => {
  const root = makePlot();
  try {
    writeFile(root, ".garden/garden.toml", baseConfig());
    writeFile(root, ".garden/agents/grower.md", agent());

    const first = sync(root);
    assert.ok(first.written.includes(".pi/agents/grower.md"));
    assert.ok(first.written.includes(".claude/agents/grower.md"));

    const check = sync(root, { check: true });
    assert.deepEqual(check.drifted, []);

    writeFile(root, ".garden/agents/grower.md", agent().replace("You are a leaf.", "Changed."));
    const drifted = sync(root, { check: true });
    assert.ok(drifted.drifted.includes(".pi/agents/grower.md"));
  } finally {
    cleanup(root);
  }
});
