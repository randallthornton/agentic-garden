import fs from "node:fs";
import path from "node:path";
import { EnforcementLevel, GardenConfig } from "../schemas/config.js";
import { listAgents, listCommands } from "./agents.js";
import { loadConfig } from "./config.js";
import { listPlants, readJournal } from "./journal.js";
import { listLeases } from "./leases.js";
import { validatePackets } from "./packets.js";
import { listStakes } from "./stakes.js";
import { sync } from "./adapters.js";

export interface DoctorReport {
  errors: string[];
  warnings: string[];
  info: string[];
  capabilities: EnforcementLevel[];
  requiredMet: boolean;
}

function detectCapabilities(root: string): EnforcementLevel[] {
  const capabilities: EnforcementLevel[] = ["advisory"];

  const piExtensions = path.join(root, ".pi", "extensions");
  const claudeSettings = path.join(root, ".claude", "settings.json");
  let claudeHooks = false;

  if (fs.existsSync(claudeSettings)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(claudeSettings, "utf8")) as {
        hooks?: unknown;
      };
      claudeHooks = Boolean(parsed.hooks);
    } catch {
      // doctor reports the invalid settings file elsewhere
    }
  }

  if (fs.existsSync(piExtensions) || claudeHooks) {
    capabilities.push("hooked");
  }

  if (fs.existsSync(path.join(root, ".garden", "orchestrator"))) {
    capabilities.push("orchestrated");
  }

  const workflows = path.join(root, ".github", "workflows");
  if (fs.existsSync(workflows)) {
    const hasGardenWorkflow = fs
      .readdirSync(workflows, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .some((entry) =>
        fs.readFileSync(path.join(workflows, entry.name), "utf8").includes("garden"),
      );
    if (hasGardenWorkflow) capabilities.push("groundskeeper");
  }

  return capabilities;
}

function validateAgents(root: string, report: DoctorReport): void {
  try {
    const agents = listAgents(root);
    if (agents.length === 0) {
      report.warnings.push("No agent definitions found in .garden/agents");
    }

    const names = new Set<string>();
    for (const agent of agents) {
      if (names.has(agent.meta.name)) {
        report.errors.push(`Duplicate agent name: ${agent.meta.name}`);
      }
      names.add(agent.meta.name);

      if (agent.meta.name !== "assistant" && agent.meta.tools.includes("dispatch")) {
        report.warnings.push(
          `${agent.meta.name} can dispatch other agents; only the assistant should dispatch.`,
        );
      }
    }
  } catch (error) {
    report.errors.push(`Agents: ${(error as Error).message}`);
  }

  try {
    listCommands(root);
  } catch (error) {
    report.errors.push(`Commands: ${(error as Error).message}`);
  }
}

function validateStakes(root: string, report: DoctorReport): void {
  try {
    const stakes = listStakes(root);
    if (stakes.length === 0) {
      report.info.push("No stakes yet");
    }
    for (const stake of stakes) {
      if (stake.meta.paths.length === 0) {
        report.warnings.push(`${stake.relFile}: stake declares no paths`);
      }
    }
  } catch (error) {
    report.errors.push(`Stakes: ${(error as Error).message}`);
  }
}

function validateJournal(root: string, report: DoctorReport): void {
  for (const plant of listPlants(root)) {
    try {
      readJournal(root, plant);
    } catch (error) {
      report.errors.push(`Journal ${plant}: ${(error as Error).message}`);
    }
  }
}

function validateLeases(root: string, report: DoctorReport): void {
  try {
    const leases = listLeases(root);
    const now = Date.now();
    for (const lease of leases) {
      if (new Date(lease.expires).getTime() <= now) {
        report.warnings.push(`Expired lease for bed ${lease.bed}`);
      }
    }
  } catch (error) {
    report.errors.push(`Leases: ${(error as Error).message}`);
  }
}

export function runDoctor(root: string): DoctorReport {
  const report: DoctorReport = {
    errors: [],
    warnings: [],
    info: [],
    capabilities: ["advisory"],
    requiredMet: true,
  };

  let config: GardenConfig;
  try {
    config = loadConfig(root);
  } catch (error) {
    report.errors.push(`Config: ${(error as Error).message}`);
    return report;
  }

  report.info.push(`Plot: ${config.plot.name}@${config.plot.version}`);

  try {
    const packets = validatePackets(root);
    report.errors.push(...packets.errors);
    report.warnings.push(...packets.warnings);
  } catch (error) {
    report.errors.push(`Packets: ${(error as Error).message}`);
  }

  validateAgents(root, report);
  validateStakes(root, report);
  validateJournal(root, report);
  validateLeases(root, report);

  const piEnabled = config.adapters.pi?.enabled ?? false;
  const claudeEnabled = config.adapters.claude?.enabled ?? false;
  report.info.push(`Adapters: pi=${piEnabled}, claude=${claudeEnabled}`);

  report.capabilities = detectCapabilities(root);
  report.info.push(
    `Enforcement capabilities: ${report.capabilities.join(", ")}`,
  );

  const required = config.enforcement.required;
  report.requiredMet = report.capabilities.includes(required);
  if (!report.requiredMet) {
    report.warnings.push(
      `Required enforcement "${required}" is not provided by the current harness; gates are advisory.`,
    );
  }

  try {
    const drift = sync(root, { check: true }, config);
    if (drift.drifted.length > 0) {
      report.warnings.push(
        `Generated artifacts are stale: ${drift.drifted.join(", ")}`,
      );
    }
  } catch (error) {
    report.errors.push(`Sync: ${(error as Error).message}`);
  }

  return report;
}
