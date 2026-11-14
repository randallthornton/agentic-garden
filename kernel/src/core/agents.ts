import fs from "node:fs";
import path from "node:path";
import { Agent, AgentMeta } from "../schemas/agent.js";
import { Command, CommandMeta } from "../schemas/command.js";
import { parseFrontmatter } from "./frontmatter.js";
import { gardenFile, toPosix } from "./paths.js";

function normalizeTools(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tool) => tool.trim())
      .filter(Boolean);
  }
  return value;
}

export function parseAgent(root: string, file: string): Agent {
  const text = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter<Record<string, unknown>>(text);
  const normalized = { ...data, tools: normalizeTools(data.tools) };
  const meta = AgentMeta.parse(normalized);
  return {
    meta,
    body,
    file,
    relFile: toPosix(path.relative(root, file)),
  };
}

export function listAgents(root: string): Agent[] {
  const dir = gardenFile(root, "agents");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => parseAgent(root, path.join(dir, entry.name)));
}

export function parseCommand(root: string, file: string): Command {
  const text = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(text);
  const meta = CommandMeta.parse(data);
  return {
    meta,
    body,
    file,
    relFile: toPosix(path.relative(root, file)),
    name: path.basename(file, ".md"),
  };
}

export function listCommands(root: string): Command[] {
  const dir = gardenFile(root, "commands");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => parseCommand(root, path.join(dir, entry.name)));
}
