# The Garden kernel

The portable kernel described by [ADR-0009](../docs/adr/0009-portable-kernel-with-harness-adapters.md) and [ADR-0010](../docs/adr/0010-enforcement-is-a-capability-ladder.md). It owns the semantics that must not diverge between harnesses: packet resolution, journal and lease validation, gate evaluation, and adapter generation.

**Status:** first spike. The CLI, packet bank, journal, leases, and hooked write-gate work. The pi and Claude Code hook adapters are the next milestone.

## Install and run

```bash
cd kernel
npm install
npm run build
node dist/cli.js --help
```

For development:

```bash
npm run dev -- --help
npm test
npm run typecheck
```

## Quick start

```bash
node dist/cli.js init       # scaffold .garden/
node dist/cli.js sync       # generate .pi/ and .claude/ artifacts
node dist/cli.js doctor     # validate the plot and report enforcement
```

## Commands

| Command | Purpose |
| --- | --- |
| `garden init [-f]` | Scaffold `.garden/` in the current directory. Idempotent unless `--force`. |
| `garden sync [--check]` | Generate harness artifacts from `.garden/`; `--check` detects drift without writing. |
| `garden doctor` | Validate config, packets, agents, stakes, journals, leases, and adapter drift. Reports the available enforcement capabilities. |
| `garden packet list [--kind seed\|graft]` | List packets. |
| `garden packet read <spec> [--kind ...]` | Read a packet by `name`, `name@version`, or `name@range`. |
| `garden packet check` | Validate semver, directory layout, and graft compatibility. |
| `garden journal append <plant> --type ...` | Append a validated `classify`, `dispatch`, `harvest`, or `compost` record. |
| `garden journal show <plant>` | Print a plant journal. |
| `garden journal list` | List journals. |
| `garden lease create --bed ... --ticket ... --stake ...` | Create a dispatch lease. Paths default to the stake's paths. |
| `garden lease list\|show\|clear` | Inspect or clear leases. |
| `garden gate pre-tool --tool write --path ...` | Evaluate the hooked write gate. Exit 0 allows, exit 2 blocks. |

## The canonical plot

```
.garden/
├── garden.toml              # plot policy, enforcement level, adapter aliases
├── agents/<role>.md         # canonical agent definitions
├── commands/<step>.md       # canonical cycle commands
├── seeds/<name>/<version>/  # seed packets (PACKET.md)
├── grafts/<name>/<version>/ # graft packets (PACKET.md)
├── stakes/<ticket>.md       # contracts
├── journal/<plant>.jsonl    # provenance and decisions
├── leases/<bed>.json        # active dispatch scopes (gitignored)
└── almanac/                 # cadence and runbooks
```

`.garden/` is the only artifact a gardener edits by hand. `.pi/` and `.claude/` are generated outputs; run `garden sync` after changing agents or commands, and `garden sync --check` in CI.

## Packets

A packet is a Markdown document with YAML frontmatter:

```yaml
---
kind: seed
name: aspnet-api
version: 1.2.0
requires: []
scope: modular-monolith
stage: first-fruit
genetics: [ef-core]
feed: [json-serializer]
soundness: "build, boot, test"
fit: "matches the stake and bed"
value: "solves the ticket"
---
```

- **Seed packets** must not declare `requires`.
- **Graft packets** must declare at least one seed generation they can join, e.g. `requires: ["aspnet-api@^1.2.0"]`.
- The directory version must match the packet version.
- Seeds are immutable: change the genetics by releasing a new generation, never by editing in place.

## Journal

Records are JSONL and validated against a discriminated union:

```json
{"ts":"2026-01-01T00:00:00.000Z","plant":"auth","type":"classify","ticket":"T-1","act":"grow","stage":"first-fruit","bed":"src/auth","stake":".garden/stakes/T-1.md"}
{"ts":"2026-01-01T00:01:00.000Z","plant":"auth","type":"dispatch","ticket":"T-1","bed":"src/auth","lease":"leases/src-auth.json"}
{"ts":"2026-01-01T00:02:00.000Z","plant":"auth","type":"harvest","ticket":"T-1","checks":{"soundness":true,"fit":true,"value":false}}
```

## Leases and the write gate

A lease is a file-based, actor-agnostic scope:

```json
{
  "bed": "src/auth",
  "ticket": "T-1",
  "stake": "stakes/T-1.md",
  "paths": ["src/auth"],
  "created": "2026-01-01T00:00:00.000Z",
  "expires": "2026-01-01T02:00:00.000Z"
}
```

The hooked gate blocks `write` and `edit` calls that are:

- outside every active lease, or
- inside `.garden/`, which is protected.

Bash mutation detection is deliberately left to the groundskeeper tier. A hook is a guardrail, not a sandbox: if a leaf has the same OS permissions as the gardener, it can bypass the gate. The strongest tier is orchestrated isolation with `.garden/` read-only.

## Adapters

`garden sync` currently generates:

- `.pi/agents/<name>.md` and `.pi/prompts/<name>.md`
- `.claude/agents/<name>.md` and `.claude/commands/<name>.md`

Canonical tools are mapped per adapter:

| Canonical | pi | Claude Code |
| --- | --- | --- |
| `read` | `read` | `Read` |
| `search` | `grep` | `Grep` |
| `glob` | `find` | `Glob` |
| `list` | `ls` | `Glob` |
| `write` | `write` | `Write` |
| `edit` | `edit` | `Edit` |
| `bash` | `bash` | `Bash` |
| `dispatch` | `subagent` | `Task` |

Agents use `model: inherit` or a model alias declared in `garden.toml`:

```toml
[adapters.pi]
model_aliases = { cheap = "claude-haiku-4-5", strong = "claude-sonnet-4-5" }

[adapters.claude]
model_aliases = { cheap = "haiku", strong = "sonnet" }
```

An alias that is not declared is an error, so a generated agent never silently names a model that does not exist.

## Enforcement capabilities

`garden doctor` reports the capabilities it can detect:

| Capability | Detection |
| --- | --- |
| `advisory` | Always available. |
| `hooked` | `.pi/extensions/` exists, or `.claude/settings.json` declares hooks. |
| `orchestrated` | `.garden/orchestrator/` exists. *(Placeholder; not built yet.)* |
| `groundskeeper` | `.github/workflows/` contains a workflow mentioning `garden`. |

`garden.toml` declares the required level. If the current harness cannot provide it, `doctor` warns that the gates are advisory rather than silently pretending.

## Next

- Generate and install the pi extension and Claude Code hooks that call `garden gate pre-tool`.
- Add packet-to-skill generation so packets are discoverable in both harnesses.
- Add `garden gate dispatch` and `garden gate harvest`.
- Add a `garden mcp` adapter for harnesses without native hooks.
