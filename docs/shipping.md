# Shipping — ripeness, not done

A leaf's "done" is a claim. Agents are trained to declare completion, and completion is the least trustworthy word in agentic engineering: it is self-reported, unverifiable from the outside, and usually true of the *code* rather than of the *feature*.

The framework therefore has no definition of done. It has a judgement of **ripeness**.

## Three checks, three parties

A fruit is ripe when three independent parties agree it can be picked. Each checks something the others cannot.

| Check | Party | Question | Catches | Misses |
| --- | --- | --- | --- | --- |
| **Soundness** | Groundskeeper (CI) | Does it build, boot, typecheck, and pass the tests its stage demands? | Rot — it isn't alive | Whether it's the right plant, or worth eating |
| **Fit** | Assistant | Is it the right plant in the right bed? Does it match the stake? Did it leave weeds or a sucker? | Misplacement, duplication, leftovers | Blind spots it shares with the leaf |
| **Value** | Gardener | Does it solve the problem it was planted for? | Green fruit — sound, fit, useless | Anything they can't run |

**The leaf that grew the fruit never certifies it.** Its self-report is evidence, not proof.

## Why all three, and not any two

- **Groundskeeper only** → green fruit ships. Tests pass; the feature is useless.
- **Groundskeeper + assistant** → both are machine judgements, and the assistant shares the leaves' blind spots. A plausible-but-wrong design passes both. It is a second opinion from the same head.
- **Assistant + gardener** → nothing mechanical. The gardener cannot verify what they cannot run, and will approve on plausibility.
- **Groundskeeper + gardener** → no fit check. Duplicates, misplaced code, and leftovers all pass.

Each pair leaves exactly the hole the third party covers. This is why the three tiers in `analogy.md` §4 are structural, not decorative.

## Harvest discipline

1. **Never hold a ripe fruit for a green one.** Ship what is ready. Delaying a finished feature behind an unrelated unfinished one is how a harvest rots on the branch.
2. **A fruit picked green never ripens.** Once an incomplete capability reaches users, you almost never return to complete it — it ossifies into the shape it shipped in. Incomplete work stays on the plant, behind a flag, not in the harvest.
3. **Harvest in succession, not in one glut.** Small, frequent harvests beat one seasonal binge: less to verify at once, faster feedback, less soil disturbance.
4. **Leave the plant healthier than you found it.** A harvest that strips the plant is a bad harvest. Concretely: no deadwood left behind, no sucker, no new weed, and the tests the work touched are stronger than they were.

## Acclimatising

The greenhouse is not the garden. A plant that thrives in CI can fail in production, so the move is gradual: behind a flag, then to a canary, then to everyone. *(Parked: hardening off.)*

## Aftercare

The plant is stressed after harvest. Watch it — errors, latency, support load, the first week of real use. A harvest with no aftercare is a gamble, not a shipment.

## Seed saving

Seed is saved at senescence, never at harvest (`analogy.md` §5). A fruit that shipped is evidence that the work was good; a plant that survived a full cycle is genetics. **Do not write the seed from an MVP** — every future sowing then inherits the MVP's shape.

## The failure that looks like success

**Windfall** — fruit that dropped before it was picked: a change that reached users without passing the gate, by hotfix, direct merge, or a deploy nobody watched. A windfall harvest is an unverified harvest. Treat it as a defect in the process, not a lucky break.
