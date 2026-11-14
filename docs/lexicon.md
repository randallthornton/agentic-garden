# Lexicon — parked terms

Terms we like but have not made canonical. `GLOSSARY.md` holds the twenty-three that the framework actually runs on.

**Promotion rule:** a parked term becomes canonical only when a practice depends on it — when a step of the cycle, a seed, or a tool would be unnamed or misnamed without it. There is no fixed count; the argument is the gate (ADR-0004). A term that is not earning its keep stays here, or gets cut.

## Ground and structure

**Plot** — the repository and the substrate it grows in. Holds plants; in a monorepo it holds several.
**Bed** — a bounded unit of ownership: one module, service, or package with an explicit edge.
**Allotment** — a plot shared by several gardeners under communal rules.
**Trellis** — the permanent structure a plant is trained onto: architectural boundaries and dependency direction.
**Espalier** — training growth along a fixed plane; architecture enforced mechanically rather than by convention.
**Roots** — the domain model. Invisible, load-bearing, brutal to move.
**Canopy** — what users see: UI and public API. The cheapest layer to regrow.
**Hardiness zone** — the support matrix the software must survive in.
**Microclimate** — one bed's local constraints: latency budgets, memory ceilings, on-prem rules.
**Drainage** — how readily information leaves the system: logs, traces, readable failures.
**Light** — the objective as the agent actually perceives it, not as it was meant.
**Soil texture** — how the code aggregates: loose and fast-draining (decoupled) versus dense and water-holding (coupled). Loam is the target.
**Humus** — the decomposed record of past decisions: ADRs, glossary, history.

## Genetics

**Cultivar** — a named, stable variety a seed produces, e.g. an ASP.NET Web API or an Angular SPA.
**Coming true** — a variety that reproduces its traits from seed: the point at which a graft has graduated into the genetics.
**Generation** — a version of a seed, released when its genetics change. Seeds are never edited in place.
**Sport** — a spontaneous genetic mutation producing growth that differs from the rest of the plant; the origin of new cultivars.
**Re-rooting** — replacing the rootstock entirely: changing the framework the plant is built on.
**Seed bank** — the collection of all seeds, including superseded generations. The compounding asset.
**Viability** — whether a seed can still germinate today.
**Sterile seed** — a seed that cannot germinate: contradictory instructions, missing prerequisites.
**Scarification** — the pre-sowing treatment that breaks dormancy: SDKs, secrets, credentials.
**Heirloom** — stable, documented, forkable without lock-in.
**Hybrid** — tuned for one narrow context; does not generalise when replanted.

## Grafting mechanics

*Grafting* is canonical; these are its parts, parked until integration work is actually built.

**Rootstock** — the established system a scion is grafted onto.
**Scion** — the new feature, module, or service grafted onto a rootstock.
**Union** — the contract where scion meets rootstock. Where grafts fail.
**Sucker** — growth from the rootstock that drains the scion: the legacy path re-emerging.
## Propagation and reshaping

**Layering** — extracting a shared piece while it is still attached and still working.
**Division** — splitting one clump into parts that grow independently.
**Cutting** — propagating from a proven specimen instead of from seed.
**Pricking out** — separating crowded seedlings into individual pots: splitting one oversized change into focused, reviewable pieces.
**Potting on** — moving a module into a larger container.
**Root bound** — a module that has filled its boundaries and is strangling itself.
**Transplanting** — moving work from the nursery into the main plot.
**Hardening off** — acclimatising before permanent residence: staged rollout, flags, canaries.
**Damping off** — a new module rotting immediately after germination.
**Nurse crop** — a temporary shim that shelters a young module and is removed once it is established.

## Tending

**Watering** — supplying current context: fresh instructions, accurate docs, relevant files.
**Root rot** — context bloat so severe the agent cannot find the roots.
**Deadwood** — code that is structurally present but no longer alive.
**Thinning** — removing surplus attempts so the strongest survives.
**Deadheading** — retiring spent scaffolding, flags, migrations, and TODOs.
**Green manure** — work grown only to be turned back into the soil: upgrades, test repairs, tooling.
**Cover crop** — cheap automation that holds the soil between seasons.
**Companion planting** — deliberately co-locating artifacts that strengthen each other.
**Scouting** — a regular walk to spot problems early.
**Plant label** — the marker at every bed: module README and agent instructions.

## Intake and shipping

**Pest** — the noun for what *treating* removes: a bug, a security hole, a flaky test, a vulnerable dependency.
**Refusal** — declining a request before it is planted. Not compost: nothing failed.
**Taste test** — the gardener using the feature as a user would, before approving the harvest. The only check that catches green fruit.
**Grading** — sorting a harvest: what ships to everyone, what stays behind a flag.
**Aftercare** — monitoring a plant after it has been harvested.
**Windfall** — fruit that dropped before it was picked: a change that reached users without passing the gate.
**Nursery** — where seedlings are raised before transplanting.

## Threats

**Beneficial insect** — an automated checker that eats pests before they spread.
**Aphid** — a small defect that accumulates quietly: warnings, drift, one-line TODOs.
**Nematode** — a hidden soil problem: races, flakiness, leaky abstractions.
**Blight** — a defect class that sweeps the whole plot at once, because every plant shares the same genetics.
**Monoculture** — one pattern, one author, or one agent's style covering everything.
**Invasive species** — a dependency or pattern spreading faster than it can be removed.
**Volunteer** — code that appeared without being planted.
**Bolting** — shipping before the feature is ripe.
**Etiolation** — fast, pale growth toward an unclear objective: volume without substance.
**Water sprout** — vigorous growth that bears no fruit.
**Co-dominant leaders** — two branches of equal vigour from one crotch: duplicated implementations, both maintained, joined at a weak point that fails under load.
**Frost** — a period in which risky growth is unsafe: release freezes, audit windows.
**Drought** — exhaustion of the resource that feeds growth: token budgets, rate limits, CI minutes.
**Quarantine bed** — an isolated branch, worktree, or sandbox for risky work.

## Cycle

**Season** — a recurring period of the plot's calendar: quarters, release trains, freezes. A calendar, never a maturity model.
**Succession planting** — staggering work so harvest is continuous.
**Intercropping** — parallel work in adjacent beds without roots competing.
**Crop rotation** — varying agent, model, or role per bed so the same weakness is not exercised season after season.
**Yield** — accepted, valuable change per season. Never lines, commits, or PRs.
**Fallow** — a deliberate season of no new planting, given over to soil amendment and planning.
**Dormancy** — live but idle. Dormant code is not dead code.
**Almanac** — the calendar of what to do when: runbooks, playbooks, operating rhythm.
**Journal** — what was planted, what died, and why.

## Crew and tools

**Groundskeeper** — automation that maintains the plot without judgement: CI, bots, schedulers.
**Potting shed** — the skills collection.
**Tool** — a single skill with a clear job and a sharp edge.
**Sharpening** — maintaining the tools themselves. A stale prompt produces worse code than no prompt.
**One bed, one leaf** — only one leaf works a bed at a time, so roots do not compete and leaves do not shade each other.

### Rejected names for the agent

**Hand** — labour that does not tire. Rejected because it hides the agent's lifespan: a hand does not start weak, accumulate context, and die.
**Annual** — a plant that lives one season and dies. Tempting, and closer than *hand*, but it makes the agent a whole plant, which makes it the object of cultivation.
**Growth agent** — names the process rather than the thing, and does not say the agent is spent.
**Sprout** — a germinated seedling. Rejected as an agent name because it is a *stage* of the plant, not an organ of it.
