# The Garden

A framework for agentic software engineering in which a codebase is a cultivated plant rather than a constructed object.

**Twenty-three canonical terms.** The gardener is the human, outside the loop. The assistant is the meta-agent that runs the cycle. Leaves are the agents that do the work. The plant is the software. Everything else lives in `docs/lexicon.md`, parked until a practice depends on it.

Two clocks run in this framework and must never be conflated: the **calendar** (parked, *season*) recurs and belongs to the plot; the **life arc** (canonical, *growth stage*) runs once per plant.

## Language

### Roles

**Gardener**:
The human who owns the plot. Sets the light, decides what the garden is for, and approves or refuses every harvest. Works outside the agent loop, so every intervention is a gate rather than a step.
_Avoid_: Head gardener, owner, operator, maintainer

**Gardener's assistant**:
The meta-agent that runs the cycle: surveys the soil, drafts and revises seeds, chooses what to sow, splits work into beds, dispatches leaves, and reviews harvests before the gardener sees them. Holds the plot's memory — seed bank, almanac, journal — and never holds its intent.
_Avoid_: Orchestrator, supervisor, planner, meta-agent, assistant gardener

**Leaf**:
An agent: an ephemeral organ of the plant that converts light into tissue, spending itself to do it. Numerous, cheap, interchangeable, and outlived by the plant it grows.
_Avoid_: Hand, worker, subagent, growth agent, gardener

### The plant

**Plant**:
The software itself: a living organism that grows, drifts, ages, and dies, and the only thing in the framework that is actually cultivated. Everything else either feeds it or tends it.
_Avoid_: Codebase, project, app, product

### Ground

**Soil**:
The substrate that determines what can grow: build speed, test reliability, type coverage, and conventions. Judged by feedback latency, not by feature count.
_Avoid_: Infrastructure, toolchain, setup

### Genetics

**Packet**:
A self-contained, semver-labelled unit of instructions handed to a leaf — a seed packet (the genetics) or a graft packet (a union). Packets compose into the set a leaf grows from, and each declares the seed generations it can join.
_Avoid_: Template, bundle, file, config

**Seed**:
A document carrying the genetics — the instructions for how the plant should grow: stack, architecture, patterns, and which dependencies are genetic. Immutable: changing the genetics produces a new generation, never an edit. The seed is the input to sowing, not the software.
_Avoid_: Template, blueprint, scaffold, boilerplate

**Feed**:
An interchangeable input the plant consumes but does not inherit from: a package you can swap without reshaping the plant. Governed by the groundskeeper, never listed in a seed.
_Avoid_: Nutrient, package, library, dependency

### Lifecycle

**Sowing**:
Handing a seed to a leaf and letting it grow the first plant. The act that starts a plant where none existed.
_Avoid_: Kickoff, initialising, scaffolding, bootstrapping

**Germination**:
The proof that a seed is viable: it produces a plant that builds, boots, and passes the tests its growth stage demands, in a clean plot. A gate, not a formality.
_Avoid_: Scaffolding, generation, bootstrap

**Growth stage**:
Where a plant sits on its one-way life arc: *seedling* (POC), *first fruit* (MVP), *full bearing* (mature), *senescent* (maintenance), *composted* (retired). Stages do not recur; the calendar does.
_Avoid_: Season, phase, maturity level, lifecycle phase

**Seed saving**:
Writing a proven plant back into its seed so the next sowing starts further along. Done at senescence, never at harvest, so the bank cannot propagate unproven genetics.
_Avoid_: Backporting, updating the template, extracting a starter

### Work

**Stake**:
A structure that holds a young plant's shape while it fills in: interfaces, contracts, and module edges written before any of the work below begins. An unstaked plant grows along the ground and is very hard to lift later.
_Avoid_: Scaffolding, stub, skeleton, boilerplate

**Growing**:
The plant extending itself: new tissue produced by its own meristems, inheriting its genetics. The default mode of work — features in the house's own idiom, which need no union because there is nothing to reconcile.
_Avoid_: Adding, feature work, extending

**Grafting**:
Joining tissue from a *different* plant onto this one — tissue whose genetics you cannot change, and must therefore translate rather than adopt. The plant becomes a chimera: two genomes, one organism, joined at a union. Its own genetics are untouched, which is why a graft never edits the seed.
_Avoid_: Integrating, retrofitting, brownfield, adding a dependency

**Mutation**:
A change to the plant's own genetics: a major version of a genetic dependency, a paradigm shift, a re-layering of the architecture. It propagates to every leaf, so it is planned at plot level and never dispatched as an ordinary bed task.
_Avoid_: Upgrade, migration, version bump

**Treating**:
The corrective act: intervening on a living plant to remove a pest or disease, without adding new growth. Defects are treated, not replanted.
_Avoid_: Fixing, bug fix, patch, workaround

**Pruning**:
Removing growth so the plant fruits instead of sprawling: deleting code, cutting scope, trimming surface area. Pruning is subtraction, and subtraction is the framework's central discipline.
_Avoid_: Refactoring, cleanup, simplification

### Shipping

**Ripeness**:
The state of being ready to harvest, established by three independent checks — soundness (groundskeeper), fit (assistant), value (gardener) — and never by the leaf that grew it. Replaces *done*, which is a claim rather than an assessment.
_Avoid_: Done, complete, definition of done, ready

**Harvest**:
Delivering work to users. Judged by yield — accepted, valuable change — never by volume.
_Avoid_: Release, ship, deploy

### Tending

**Mulch**:
Cheap, pervasive surface protection that suppresses weeds: formatting, lint, types, pre-commit hooks, CI gates.
_Avoid_: Guardrails, quality gates, linting

**Weed**:
Entropy that outcompetes intended growth without being a defect: drift, dead code, stale docs, duplicated logic, unowned files.
_Avoid_: Tech debt, cruft, cleanup

**Compost**:
The processing of failure into nutrients: post-mortems distilled into rules, tests, and instructions. A failure that produces no new rule is wasted.
_Avoid_: Retrospective, lessons learned, post-mortem
