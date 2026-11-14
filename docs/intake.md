# Intake — how work enters the plant

Work arrives as tickets, and a ticket is a *claim* about work rather than the work itself. Every ticket describes tissue to be added, removed, or repaired — and the first question is not *what* to build but **whose genetics**: is this the plant's own growth, or tissue from another plant?

Ticket wording skips that question. It says "add", "support", "implement", so a leaf handed a raw ticket will invent new tissue regardless of whether the plant already grows it. **An unclassified ticket is an invitation to invent.**

## The six acts

Every incoming item is one of six acts. The act decides what the leaf may do, what it must not do, and what the germination bar is.

| Class | Act | Reads as | Must not | Failure if misclassified |
| --- | --- | --- | --- | --- |
| **New plant** | Sow | "new service", "new app", greenfield | Sow without a seed | A plant with invented genetics |
| **Own tissue** | Grow | "add", "support", "allow", in-house idiom | Grow *beside* an existing implementation | **Co-dominant leaders** — two equal branches sharing a weak crotch |
| **Foreign tissue** | Graft | "integrate", "vendor", "third-party", "migrate from", "SDK" | Let foreign idioms leak past the union | **Union failure** — the contract does not hold |
| **Own genetics** | Mutate | "upgrade", "migrate to", "major version", "re-architect" | Dispatch as an ordinary bed task | A **half-mutated plant** — some leaves on the old genetics, some on the new |
| **Defect** | Treat | "broken", "error", "regression", "should but doesn't" | Grow a workaround around the fault | A **sucker** — new growth draining the real plant |
| **Structure** | Prune | "refactor", "slow", "hard to change", "duplicated" | Add a parallel implementation | Co-dominant leaders, and a second source of truth |

**Most work is growth.** But growth is not planting. A growing leaf extends a plant that already exists, and its first duty is to **inherit** — to read the plant and match its conventions, naming, and layer boundaries. A leaf that grows without reading produces vigorous, wrong-shaped tissue (a *water sprout*), and the fix is pruning, not replanting.

Grafting is the narrow case, not the default: it applies only when the tissue comes from **another** plant. Working in an existing repository is not grafting. Working in an existing repository *with foreign genetics* is.

## The five gates

Nothing is dispatched until all five are answered. Gates 1–4 are the assistant's; gate 5 is shared with the leaf.

**1. Classify.** Which of the six acts? A ticket that reads as growth but describes a defect is treating. A ticket that reads as a fix but describes a misshapen plant is pruning. A ticket that reads as growth but imports a library's idiom into the plant is grafting. A ticket that reads as growth but bumps a genetic dependency's major version is a mutation.

**2. Belong.** Walk the plant before growing. Is there existing tissue doing this job? If so, **grow from it** — extend the existing module rather than starting a second one. Two equal branches from one crotch is a co-dominant leader, and the joint fails under load. Failing to search first is the largest single source of duplicated logic in agent-written code, and duplication is how a plot becomes a **monoculture** — every plant sharing one weakness.

**3. Stage.** What growth stage does this work touch, and what does that do to the germination bar? A treatment on a full-bearing plant must not regress the full suite. A seedling only has to prove it lives. **The stage, not the ticket, sets the bar.**

**4. Bed.** Which module owns it? One bed, one leaf. If no bed owns it, that is an architecture question and it goes to the gardener — not to a leaf. A leaf handed unowned ground will invent a bed.

*A mutation skips this gate.* It propagates to every leaf, so it is planned at plot level and escalated to the gardener. Dispatching a genetics change as a bed task is how a plant ends up half-mutated.

**5. Stake.** The contract goes in before the implementation: the failing test, the interface, the acceptance criteria. **A leaf never writes its own stake.** A leaf that defines its own success criteria has already certified itself, which is the one thing the framework exists to prevent.

The leaf is dispatched with two things: the **packets** (how to grow) and the **stake** (what to grow). Neither substitutes for the other — a leaf with packets but no stake grows correctly in the wrong direction.

## Refusal

Not all work belongs in this plot. A feature that fights the trellis, duplicates existing growth, or serves a goal the gardener never set is refused — before anything is planted.

**Refusal is not compost.** Compost is for attempts that failed. Refusal is for requests that were never planted: nothing died, so nothing is owed to the soil. Refused work returns to the requester with a reason, not into a backlog where it quietly rots.

**Only the gardener refuses.** A leaf that can decline a ticket will decline every hard one.

## The six ways intake fails

- **Invented growth** — new tissue grown without reading the plant, so it matches nothing and must be pruned back.
- **Co-dominant leaders** — a second implementation grown beside the first, both maintained, the crotch weak.
- **Failed union** — foreign tissue accepted without a contract, so its idioms leak into the plant and every future leaf inherits someone else's genetics.
- **Half-mutated plant** — a genetics change dispatched as a bed task, so some leaves grew on the old genetics and some on the new.
- **Treated with a graft** — the fault is still there, wrapped in new growth.
- **Bed invented** — nobody owned the ground, so the leaf staked a claim to it.

Each is cheap to prevent at intake and expensive to unpick afterwards. That asymmetry is the entire justification for the gate.
