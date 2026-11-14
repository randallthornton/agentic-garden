#!/usr/bin/env node

import { Command } from "commander";
import { findPlotRoot } from "./core/paths.js";
import { runInit } from "./commands/init.js";
import { doctorCommand } from "./commands/doctor.js";
import {
  packetCheck,
  packetList,
  packetRead,
} from "./commands/packet.js";
import {
  journalAppend,
  journalList,
  journalShow,
} from "./commands/journal.js";
import {
  leaseClear,
  leaseCreate,
  leaseList,
  leaseShow,
} from "./commands/lease.js";
import { gatePreTool } from "./commands/gate.js";
import { syncCommand } from "./commands/sync.js";
import type { PacketKind } from "./schemas/packet.js";

function fail(error: unknown): void {
  console.error((error as Error).message);
  process.exitCode = 1;
}

function withPlot(action: (root: string) => number | void): void {
  try {
    const root = findPlotRoot();
    const code = action(root);
    if (typeof code === "number") {
      process.exitCode = code;
    }
  } catch (error) {
    fail(error);
  }
}

function parseKind(value?: string): PacketKind | undefined {
  if (!value) return undefined;
  if (value !== "seed" && value !== "graft") {
    throw new Error("--kind must be seed or graft");
  }
  return value;
}

const program = new Command();

program
  .name("garden")
  .description(
    "The Garden kernel: packets, journal, leases, gates, and harness adapters.",
  )
  .version("0.0.1");

program
  .command("init")
  .description("Scaffold a .garden/ directory in the current working directory")
  .option("-f, --force", "overwrite existing files")
  .action((options: { force?: boolean }) => {
    try {
      const result = runInit(process.cwd(), { force: options.force });
      console.log(`Created ${result.created.length} file(s).`);
      for (const file of result.created) {
        console.log(`  ${file}`);
      }
      if (result.skipped.length > 0) {
        console.log(`Skipped ${result.skipped.length} existing file(s).`);
      }
      console.log("");
      console.log("Next: garden sync && garden doctor");
    } catch (error) {
      fail(error);
    }
  });

program
  .command("doctor")
  .description("Validate the plot and report the available enforcement level")
  .action(() => withPlot((root) => doctorCommand(root)));

const packet = program
  .command("packet")
  .description("Inspect the seed bank");

packet
  .command("list")
  .description("List packets")
  .option("--kind <kind>", "seed or graft")
  .action((options: { kind?: string }) => {
    withPlot((root) => packetList(root, parseKind(options.kind)));
  });

packet
  .command("read")
  .description("Read a packet by name and version or range")
  .argument("<spec>", "name@version, name@range, or name")
  .option("--kind <kind>", "seed or graft")
  .action((spec: string, options: { kind?: string }) => {
    withPlot((root) => packetRead(root, spec, parseKind(options.kind)));
  });

packet
  .command("check")
  .description("Validate packet semver, requirements, and directory layout")
  .action(() => withPlot((root) => packetCheck(root)));

const journal = program
  .command("journal")
  .description("Read and append plant journals");

journal
  .command("append")
  .description("Append a journal record")
  .argument("<plant>", "plant name")
  .requiredOption("--type <type>", "classify, dispatch, harvest, or compost")
  .option("--ticket <ticket>")
  .option("--act <act>")
  .option("--stage <stage>")
  .option("--bed <bed>")
  .option("--stake <stake>")
  .option("--lease <lease>")
  .option("--soundness", "soundness check passed")
  .option("--fit", "fit check passed")
  .option("--value", "value check passed")
  .option("--failure <failure>")
  .option("--rule <rule>")
  .action((plant: string, options: Record<string, unknown>) => {
    withPlot((root) => {
      const record = journalAppend(root, {
        plant,
        type: String(options.type),
        ticket: options.ticket as string | undefined,
        act: options.act as string | undefined,
        stage: options.stage as string | undefined,
        bed: options.bed as string | undefined,
        stake: options.stake as string | undefined,
        lease: options.lease as string | undefined,
        soundness: Boolean(options.soundness),
        fit: Boolean(options.fit),
        value: Boolean(options.value),
        failure: options.failure as string | undefined,
        rule: options.rule as string | undefined,
      });
      console.log(JSON.stringify(record, null, 2));
    });
  });

journal
  .command("show")
  .description("Show a plant journal")
  .argument("<plant>", "plant name")
  .action((plant: string) => withPlot((root) => journalShow(root, plant)));

journal
  .command("list")
  .description("List journals")
  .action(() => withPlot((root) => journalList(root)));

const lease = program
  .command("lease")
  .description("Manage dispatch leases");

lease
  .command("create")
  .description("Create a lease for a bed")
  .requiredOption("--bed <bed>", "bed name")
  .requiredOption("--ticket <ticket>", "ticket identifier")
  .requiredOption("--stake <stake>", "stake path relative to the plot")
  .option("--paths <paths>", "comma-separated paths; defaults to the stake's paths")
  .option("--ttl <ttl>", "lease duration", "2h")
  .action((options: { bed: string; ticket: string; stake: string; paths?: string; ttl?: string }) => {
    withPlot((root) => leaseCreate(root, options));
  });

lease
  .command("list")
  .description("List leases")
  .action(() => withPlot((root) => leaseList(root)));

lease
  .command("show")
  .description("Show a lease")
  .argument("<bed>", "bed name")
  .action((bed: string) => withPlot((root) => leaseShow(root, bed)));

lease
  .command("clear")
  .description("Clear a lease")
  .argument("<bed>", "bed name")
  .action((bed: string) => withPlot((root) => leaseClear(root, bed)));

const gate = program
  .command("gate")
  .description("Evaluate a gate");

gate
  .command("pre-tool")
  .description("Check whether a tool call may proceed")
  .requiredOption("--tool <tool>", "tool name")
  .option("--path <path>", "path being written")
  .option("--command <command>", "bash command")
  .action((options: { tool: string; path?: string; command?: string }) => {
    withPlot((root) => gatePreTool(root, options));
  });

program
  .command("sync")
  .description("Generate harness artifacts from .garden/")
  .option("--check", "check for drift without writing")
  .action((options: { check?: boolean }) => {
    withPlot((root) => syncCommand(root, { check: options.check }));
  });

program.parse();
