# The Analogy, Mapped

The glossary fixes names. This document explains why the mapping holds, how the cycle actually runs, and where the metaphor has to stop.

## 1. Why gardening and not construction

Construction assumes: the thing is inert, the plan precedes the work, "done" is a state you reach, and defects come from bad building.

Software violates all four. Agentic software violates them harder:

| Construction assumes | Cultivation assumes |
| --- | --- |
| The artefact is inert | The artefact is alive — it drifts, rots, and grows |
| The plan is the hard part | The *conditions* are the hard part |
| Done is a state | Done never final — the work repeats |
| Defects are building errors | Defects are pests — they arrive from outside and adapt |

The construction metaphor produces waterfall thinking and one-shot prompts. The cultivation metaphor produces feedback loops, substrate work, and continuous small corrections — which is what agent-written code actually demands.

## 2. The layers

The plot has four layers, ordered by how expensive they are to change.

```
   ┌──────────────────────────────────────────────────────┐
   │  Canopy      what users see: UI, public API          │   cheap to change
   ├──────────────────────────────────────────────────────┤
   │  Trellis     boundaries, dependency direction        │
   ├──────────────────────────────────────────────────────┤
   │  Roots       the domain model, the data, the truth   │
   ├──────────────────────────────────────────────────────┤
   │  Soil        build speed, tests, types, conventions  │   expensive to change
   └──────────────────────────────────────────────────────┘
```

**Soil** is the layer agents never ask about and always depend on. A slow test suite, an unreliable build, or an absent type system is compacted, waterlogged ground: nothing planted in it will thrive, regardless of the seed. Every framework decision that touches soil is expensive to reverse, which is why those decisions get ADRs.

**Roots** are the domain model. They are invisible from above, they hold the whole plant up, and they are brutal to move once established. An agent can rewrite the canopy in an afternoon; a wrong root assumption can cost a quarter.

**Trellis** is architecture — the structure the plant is trained onto. It does not create growth, but it decides the shape of it. A trellis that exists only in a document is a trellis that will be ignored; espalier is architecture enforced mechanically.

**Canopy** is where the fruit is, and the only layer most people judge the garden by. It is also the cheapest to regrow. That asymmetry is the whole argument for investing downward.

## 3. The cycle

Growth is continuous; the cycle is episodic. A plant grows whether or not anyone tends it — the cycle is the set of interventions that shape that growth, and every step exists because skipping it has a known, named failure.

### Survey — *scouting*
Walk the plot before touching it. Build status, test health, drift, open TODOs, dependency age. The output is a soil report, not a task list. *Skipping it means planting into ground you have not read.*

### Amend — *compost, green manure, mulching*
Do the invisible work first: fix the flaky test, add the missing type, repair the slow build. *Skipping it is the single most common cause of a disappointing sowing.* An agent handed bad soil will produce code that looks fine and cannot be verified.

### Sow — *choosing a seed and planting*
Pick a seed from the bank. Sow into a clean bed. *Skipping the seed and starting from a blank directory* means the agent invents genetics on the spot, and every sowing produces a different species.

### Germinate — *the viability test*
The seed must prove itself: build, boot, test, in a clean plot. This is a gate, not a formality. A sterile seed is discovered here or it is discovered in production. **A seed that is not germination-tested is not a seed; it is a suggestion.**

### Stake — *staking the seedling*
Immediately after germination, the structure goes in: the interfaces, the contracts, the module edges, the plant label. A seedling left unstaked grows along the ground and is very hard to lift later.

### Tend — *watering, weeding, pruning, thinning, scouting*
The bulk of the work, and the part that is never finished. Watering is context supply. Weeding is drift removal. Pruning is deletion. Thinning is choosing. The rule of tending: **small and often beats large and rare.** A plot weeded weekly needs no heroic cleanup.

### Harvest — *shipping*
Deliver to users. Judge the harvest by yield, never by volume. A harvest that consumed soil without returning nutrients is mining.

### Save seed — *the compounding step*
Take what worked and write it back into the seed. The implementation that survived contact with reality is worth more than the document that predicted it. This is how the bank gets better; without it, every season starts where the last one did.

### Fallow — *deliberate pause*
Stop planting. Amend soil, process compost, update the almanac, plan the next season. Fallow is not idleness; it is the only step that improves the ground.

## 4. Roles

The **gardener is the human**, and the gardener is outside the loop. Everything inside the loop is either the assistant or a leaf.

| Role | Who | Loop position | Acts | Owns |
| --- | --- | --- | --- | --- |
| **Gardener** | Human | Outside | Rarely, expensively | Light, soil policy, judgement, harvest approval |
| **Gardener's assistant** | Meta-agent | Around | Continuously, cheaply | Survey, seeds, choice of seed, splitting work into beds, dispatch, harvest pre-review |
| **Leaf** | Agent | Inside | Constantly, locally | One bed, one task |
| **Groundskeeper** | CI, bots | Background | On schedule | Mulch, scouting reports, cover crops, weed alerts |

- The **gardener** acts rarely and expensively. Every intervention is a gate: set the light, approve the harvest, refuse. The gardener does not pull weeds, does not sow, and does not review every commit.
- The **assistant** acts continuously and cheaply. It holds the plot's memory — seed bank, almanac, journal — and runs the cycle around the work: it surveys the soil before sowing, drafts and revises seeds, splits work into beds, dispatches leaves, and reviews the harvest so the gardener is only ever shown things worth seeing. It never holds the plot's *intent*.
- **Leaves** act constantly and locally. One bed, one leaf. A leaf is the organ that converts light into tissue: it takes the objective it can see and turns it into code. Leaves are numerous, cheap, interchangeable, and spent once they fruit — the plant outlives them.

### Why leaves and not plants

An agent does have a life. It germinates on the first token, grows as it accumulates context, fruits as it produces a change, and dies when its context ends. That is plant-like enough that calling it a plant is tempting, and it is a real observation — agents are stunted by bad soil, defined by their seed, and can be shaded.

But a plant is rooted, persistent, and *is the thing being cultivated*. If the agent is the plant, the code has no place in the metaphor, and — worse — the agent becomes the object of care. That is the dominant failure mode in agentic tooling today: people tend prompts and context windows instead of tending code.

**The plant is the software. The agent is an organ of it** — ephemeral, plural, and disposable. Leaves are the right organ because they do exactly what an agent does: they convert an external input (light) into structure (tissue), and they are spent doing it.

### The asymmetry is deliberate

The assistant is a *role*, not an organ. Anything that tends a plant has to be able to see it, so the assistant stands outside the plant while acting inside the loop. It is the gardener's delegate, not part of the codebase.

### Failure modes

- A **gardener who enters the loop** becomes a leaf and loses the plot. This is the most common failure in agentic work: the human starts typing instead of setting conditions and judging outcomes.
- An **assistant that decides what the garden is for** has quietly promoted itself. The assistant proposes; the gardener disposes.
- A **leaf that chooses what to grow** has started volunteering. Scope creep is not a leaf's mistake to make.
- A **shaded leaf** cannot see the light. A subagent given a task but not the objective is shaded by the canopy above it, and will grow toward whatever small light it can find.

The assistant is the part of this framework that has to be built. The gardener is a role, not a tool.

## 5. Growth stages — the second clock

A plot has two clocks, and conflating them is the classic gardening mistake.

The **calendar** (parked: *season*) is external, cyclical, and shared by everything on the plot: quarters, release trains, freezes, audit windows. It recurs. It belongs to the plot, not to any one plant.

The **life arc** (canonical: **growth stage**) is internal, one-way, and per plant. It does not recur. You do not return to POC next spring.

| Stage | Product phase | What it is |
| --- | --- | --- |
| **Seedling** | POC | Alive, unproven, in the nursery. Proves it lives; nothing more. |
| **First fruit** | MVP | Bears one fruit. Has earned its space. |
| **Full bearing** | Mature | Crops steadily. Established, and worth investing in. |
| **Senescent** | Maintenance | No new growth. Holding on, harvesting what is already there. |
| **Composted** | Retired | Pulled, composted, seed saved. |

Four rules fall out, and they are the reason this is canonical rather than decoration:

1. **Tending depends on the stage.** You water and stake a seedling; you never prune it. You prune for structure at first fruit, for fruit at full bearing, and not at all once senescent. Tending a seedling like a mature plant is how you kill it.
2. **The germination bar depends on the stage.** A seedling does not need the full test suite — it needs to prove it lives. A full-bearing plant does. So a seed declares the stage it is germinating at, and the gate is set accordingly.
3. **Seed saving happens at senescence, not at harvest.** You save seed from a plant that survived a full cycle. Saving seed from an MVP propagates unproven genetics into every future sowing — and every future sowing then inherits the MVP's shape. This is the single most important consequence of the model.
4. **Growth stage is per bed, not per plot.** A monorepo holds seedlings and senescent plants side by side. The assistant has to know which is which before it dispatches anything.

Senescence is the uncomfortable stage, which is why it is named honestly. Maintenance mode is not a season; it is managed decline. The framework's job is to make sure a senescent plant is either harvested and composted, or deliberately renewed — never left to linger because nobody wants to say the word.

## 6. Three ways tissue gets added

Every piece of work is tissue added to a plant, and the question that decides everything is **whose genetics**. It is not greenfield versus brownfield — both growth and grafting happen inside an established repository.

**Sowing** — a new plant from a seed. No plant existed. The seed carries the genetics, so the first generation is already consistent with everything planted before it.

**Growing** — the plant extending itself. New tissue from its own meristems, inheriting its genetics automatically. This is the default: most work is a feature grown in the house's own idiom, and it needs no union because there is nothing to reconcile.

**Grafting** — tissue from a *different* plant joined onto this one: a third-party SDK, a vendored module, a team boundary, a legacy bridge, a pattern imported from another codebase. Foreign genetics cannot be inherited, only translated, so a graft needs a **union** — the contract where the two tissues meet. Graft failure is union failure, and the rootstock may throw **suckers**: the old path regrowing underneath the new growth and quietly draining it.

The practical consequence is a different first duty for each:

- A **growing** leaf **inherits**. Its job is to read the plant and match it — conventions, naming, patterns, layer boundaries. Growth that ignores the plant is vigorous but wrong-shaped: a *water sprout*, or a second branch of equal vigour grown beside the first, which is a **co-dominant leader** and fails at the crotch.
- A **grafting** leaf **translates**. It cannot inherit foreign idioms, so it must build the union explicitly, or those idioms leak into the plant and every future leaf inherits someone else's genetics.

Where an established plant must be split rather than extended, prefer **layering** — extracting the shared piece while it is still attached and still working — over cutting it out and hoping it survives.

### Genetics, feed, and graft

Three different things arrive at a plant, and each is governed by a different party.

| | What it is | Test | Governed by |
| --- | --- | --- | --- |
| **Genetics** | A dependency or decision whose patterns the plant adopts, and therefore inherits | You **adopt** its genetics | The seed, declared by the gardener |
| **Feed** | An interchangeable input the plant consumes but does not inherit from | You can **swap** it without reshaping the plant | The groundskeeper — bots, lockfiles, scanners |
| **Graft** | Tissue whose genetics you do not control | You must **translate** rather than adopt | The union, built by the grafting leaf |

EF Core is genetics: it decides how entities are modelled, how the data layer is shaped, how migrations work, and every leaf inherits that. A JSON serializer is feed: it becomes tissue, not form, and swapping it changes call sites rather than architecture.

**Feed is not in the seed.** A seed that lists its JSON serializer is a seed that will rot the moment the serializer is swapped. Feed is the groundskeeper's business — dependency bots, lockfile freshness, vulnerability scanning — and it matters only when it goes stale, which is a supply-chain weed, not a genetic event.

**Grafting is not "any new dependency."** A package you adopt is genetics or feed, and both are things you chose. A graft is tissue whose genetics you *cannot* change: an external service's domain model, another team's module, a vendored library, a legacy bridge. You do not adopt those patterns; you translate them at a union. That is why grafting is rare, and why it is expensive.

### Mutation

One act the three above do not cover: changing the plant's own genetics. A major version of a genetic dependency, a paradigm shift, a re-layering of the architecture. A mutation propagates to every leaf, so it is planned at plot level and never dispatched as an ordinary bed task. Some mutations are beneficial, some kill the plant, and the plant may have to be re-expressed entirely in the new genetics before it can grow again.

### Why a graft never edits the seed

A graft does not change the plant's genetics. The plant becomes a **chimera** — two genomes in one organism, joined at a union — while its own genetics are untouched. That is exactly what a real graft is, and it is why grafting is the one act that can leave the seed alone.

Seeds are immutable. When the genetics genuinely change — a mutation, or seed saved from a proven plant — a **new generation** is released and the old one stays in the bank. A seed that changes under you is not a seed; it is a moving target, and every plant grown from it becomes undocumented.

A graft therefore writes to the plant's **journal**, not to its seed. If a graft becomes part of how the variety is always grown, that is a new generation of the seed, not an edit to the old one.

## 7. Where the analogy breaks

A metaphor that cannot be falsified becomes a religion. These are the places this one fails, and what to do instead.

**Plants cannot be instructed; agents can.** In a real garden the gardener has no influence over *how* a tomato grows, only over conditions. An agent can be told. So the framework must not over-rotate on "just improve the conditions" — explicit instructions, acceptance criteria, and examples are genuine levers that have no gardening equivalent. **Correction:** the seed document is the instruction channel, and it is a first-class artifact, not merely "soil".

**Gardens are cyclical; software is cumulative.** You replant a bed every year; you rarely un-ship a feature. Growth rings do not come off. **Correction:** seasons are a calendar, never a maturity model — a season recurs, a product's maturity does not (see §5). And a shipped feature is a perennial, not an annual: it does not die on schedule just because the season that produced it did.

**"Weed" is a value judgement.** One gardener's weed is another's ground cover. In code, "dead code" is sometimes a deliberate, load-bearing escape hatch. **Correction:** weeding requires an owner's intent, not a heuristic. A leaf cannot tell your ground cover from your weed, so weeding is proposed by the assistant and approved by the gardener — never executed unsupervised.

**Failure in a garden is natural; failure in software is usually ours.** Blaming weather is honest horticulture and dishonest engineering. **Correction:** keep **pest**, **blight**, and **damping off** as *failure-mode names*, not as excuses. Every one of them should end in compost.

**The metaphor romanticises maintenance.** Tending sounds noble; it is often just unowned work that nobody scheduled. **Correction:** every tending activity must have a cadence, an owner, and a definition of "enough". Otherwise "tend the garden" becomes "someone should really clean this up".

**Greenfield bias.** Gardens start empty and are planted. Repos start full and must be *entered*. **Correction:** most work is **growing** — extending a plant that already exists and inheriting its genetics. Sowing is the rare case, not the norm, and grafting is rarer still: it applies only when the tissue comes from another plant.

**Growth is not always good.** In a garden, more growth is usually better. In software, growth is often the problem — the etiolated sprawl, the water sprout, the monoculture. **Correction:** the framework's central discipline is *pruning*, and pruning is subtraction. A framework that only knows how to plant will produce a jungle.
