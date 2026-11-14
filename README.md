# The Garden

**A framework for agentic software engineering, organised around cultivation rather than construction.**

> A garden is not built. It is tended.

The construction metaphor — blueprints, scaffolds, builders, specs — assumes the thing being made is inert. It arrives finished or it doesn't arrive at all. That model fits poured concrete. It fits software badly, and it fits *agent-written* software worse.

Agentic software engineering is closer to gardening:

- The output is **alive**. It grows, drifts, rots, and needs continuous care.
- Quality is determined mostly by the **substrate** — soil, light, drainage — not by how loudly you instruct the plant.
- You never get a finished garden. You get a **cycle** you repeat.
- The gardener's job is **conditions and judgement**, not manufacture.

## The six claims

1. **Substrate over instructions.** A fast, honest test suite with types and conventions will out-produce a brilliant prompt in a bad environment. Amend the soil before you sow.
2. **Seeds over blank pages.** Never start a leaf from an empty directory. Give it a *seed*: a document that carries the genetics — stack, architecture, paradigms, and the rules for tending what grows from it.
3. **Germination over trust.** A seed is not viable until it has proven it grows in a clean plot: it builds, it boots, its tests pass. Trust is not a strategy; germination is a test.
4. **Mulch over heroics.** Cheap, pervasive guardrails — lint, types, pre-commit, contract tests — suppress drift continuously. Annual heroic cleanups are what you do when you skipped the mulch.
5. **Compost over blame.** Every failure is feedstock. A bug that produced no new rule, test, or instruction was wasted.
6. **Seed saving over delivery.** A shipped feature is a harvest. A *seed* is a harvest that also improves the next sowing. The framework's compounding asset is the seed bank, not the code.

## Who does what

| Role | Who | Loop position |
| --- | --- | --- |
| **Gardener** | You | Outside the loop — sets the light, approves the harvest, refuses bad work |
| **Gardener's assistant** | Meta-agent | Around the loop — surveys, drafts seeds, splits work, dispatches leaves, pre-reviews harvests |
| **Leaves** | Agents | Inside the loop — one bed, one task |

The **plant** is the software. **Leaves** are the agents: ephemeral organs that convert light into tissue and are spent doing it. The plant is what you cultivate; leaves are outlived by it.

Three tiers, distinguished by how often they act and how much it costs to be wrong. The gardener intervenes rarely and expensively; the assistant continuously and cheaply; the leaves constantly and locally. Each tier has its own failure mode: a gardener who enters the loop becomes a leaf and loses the plot; an assistant that decides what the garden is *for* has quietly promoted itself; a leaf that chooses what to grow has started volunteering; a shaded leaf cannot see the light.

## The cycle

```
Survey → Amend → Sow → Germinate → Stake → Tend → Harvest → Save seed → Fallow
  ↑                                                                        │
  └────────────────────────────────────────────────────────────────────────┘
```

Every pass through the cycle should leave the soil better than it found it. A cycle that only produced code and consumed soil is mining, not gardening.

The cycle repeats. Maturity does not. A product's POC → MVP → mature → maintenance arc is a one-way **growth stage**, not a season — and the right tending, the germination bar, and the moment you may save seed all depend on which stage a bed is in. See `docs/analogy.md` §5.

**Most work is growth.** A leaf adding a feature to an existing plant is not grafting — it is the plant extending itself, and its first duty is to inherit the plant's genetics rather than invent new ones. Grafting is reserved for tissue from *another* plant: a third-party SDK, a foreign pattern, a team boundary, a legacy bridge. The distinction is **whose genetics**, not new repo versus old. See `docs/intake.md`.

## What lives here

| Path | Contents |
| --- | --- |
| `GLOSSARY.md` | The canonical vocabulary — twenty-three terms, one name per concept. |
| `docs/seed-bank.md` | Packets, semver, composition, pinning, graduation. |
| `docs/intake.md` | How work enters the plant: six acts, five gates. |
| `docs/shipping.md` | How work leaves: ripeness, harvest discipline, aftercare. |
| `docs/lexicon.md` | Parked terms. Good words we have not made binding yet. |
| `docs/analogy.md` | The full mapping: layers, cycle, roles, and where the metaphor breaks. |
| `docs/adr/` | Decisions about the framework itself. |
| `seeds/` | The seed bank — one document per variety. *(not yet populated)* |
| `tools/` | The potting shed — the skills collection. *(not yet populated)* |

## A note on the metaphor's limits

Read `docs/analogy.md` before extending the vocabulary. The metaphor is a **design language**, not a cosmology. It earns its keep where it makes a real practice easier to remember and harder to skip. It costs you wherever it invites passivity — waiting for growth instead of verifying it, or romanticising maintenance that is actually just unowned work.
