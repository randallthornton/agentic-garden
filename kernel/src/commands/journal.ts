import {
  appendJournal,
  listPlants,
  readJournal,
} from "../core/journal.js";
import { JournalRecord } from "../schemas/journal.js";

export interface JournalAppendOptions {
  plant: string;
  type: string;
  ticket?: string;
  act?: string;
  stage?: string;
  bed?: string;
  stake?: string;
  lease?: string;
  soundness?: boolean;
  fit?: boolean;
  value?: boolean;
  failure?: string;
  rule?: string;
}

function requireField(
  value: string | undefined,
  field: string,
  type: string,
): string {
  if (!value) {
    throw new Error(`journal ${type} requires --${field}`);
  }
  return value;
}

export function journalAppend(
  root: string,
  options: JournalAppendOptions,
): JournalRecord {
  const base = {
    ts: new Date().toISOString(),
    plant: options.plant,
    type: options.type,
  };

  let record: unknown;

  switch (options.type) {
    case "classify":
      record = {
        ...base,
        ticket: requireField(options.ticket, "ticket", "classify"),
        act: requireField(options.act, "act", "classify"),
        stage: requireField(options.stage, "stage", "classify"),
        bed: requireField(options.bed, "bed", "classify"),
        stake: options.stake,
      };
      break;
    case "dispatch":
      record = {
        ...base,
        ticket: requireField(options.ticket, "ticket", "dispatch"),
        bed: requireField(options.bed, "bed", "dispatch"),
        lease: requireField(options.lease, "lease", "dispatch"),
      };
      break;
    case "harvest":
      record = {
        ...base,
        ticket: requireField(options.ticket, "ticket", "harvest"),
        checks: {
          soundness: Boolean(options.soundness),
          fit: Boolean(options.fit),
          value: Boolean(options.value),
        },
      };
      break;
    case "compost":
      record = {
        ...base,
        failure: requireField(options.failure, "failure", "compost"),
        rule: requireField(options.rule, "rule", "compost"),
      };
      break;
    default:
      throw new Error(
        `Unknown journal type: ${options.type}. Use classify, dispatch, harvest, or compost.`,
      );
  }

  return appendJournal(root, options.plant, record);
}

export function journalShow(root: string, plant: string): void {
  const records = readJournal(root, plant);
  if (records.length === 0) {
    console.log(`No journal records for ${plant}.`);
    return;
  }

  for (const record of records) {
    console.log(JSON.stringify(record, null, 2));
  }
}

export function journalList(root: string): void {
  const plants = listPlants(root);
  if (plants.length === 0) {
    console.log("No journals found.");
    return;
  }

  for (const plant of plants) {
    console.log(plant);
  }
}
