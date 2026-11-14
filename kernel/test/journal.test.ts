import assert from "node:assert/strict";
import test from "node:test";
import { appendJournal, readJournal } from "../src/core/journal.js";
import { cleanup, makePlot } from "./helpers.js";

test("appends and reads a validated journal", () => {
  const root = makePlot();
  try {
    appendJournal(root, "plant-a", {
      ts: "2026-01-01T00:00:00.000Z",
      plant: "plant-a",
      type: "classify",
      ticket: "T-1",
      act: "grow",
      stage: "first-fruit",
      bed: "src/auth",
      stake: "stakes/T-1.md",
    });

    appendJournal(root, "plant-a", {
      ts: "2026-01-01T00:01:00.000Z",
      plant: "plant-a",
      type: "harvest",
      ticket: "T-1",
      checks: { soundness: true, fit: true, value: false },
    });

    const records = readJournal(root, "plant-a");
    assert.equal(records.length, 2);
    assert.equal(records[0].type, "classify");
    assert.equal(records[1].type, "harvest");
  } finally {
    cleanup(root);
  }
});

test("rejects an invalid journal record", () => {
  const root = makePlot();
  try {
    assert.throws(() =>
      appendJournal(root, "plant-a", {
        ts: "2026-01-01T00:00:00.000Z",
        plant: "plant-a",
        type: "classify",
        ticket: "T-1",
      }),
    );
  } finally {
    cleanup(root);
  }
});
