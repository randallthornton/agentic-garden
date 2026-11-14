# The seed bank — packets, versions, and graduation

The bank is not a folder of templates. It is a lineage of versioned **packets**, and a compatibility graph between them.

## Packets

A packet is a self-contained, semver-labelled unit of instructions handed to a leaf. There are two kinds:

- **Seed packet** — the genetics: stack, architecture, patterns, and which dependencies are genetic.
- **Graft packet** — a union: how to join foreign tissue onto this plant.

A leaf is dispatched with a *set* of packets. The packets say **how** to grow; the stake says **what** to grow. A leaf with packets but no stake grows correctly in the wrong direction.

Packets are **cooperative**: they must be mutually consistent. A graft packet may extend the seed's conventions, but it may not contradict them. Contradiction is a failed union, and it is much cheaper to detect before the union is built.

## Semver semantics

Labels are self-declared, and the digits have fixed meanings. A version without semantics is just a number.

**Seed packet**

| | Meaning |
| --- | --- |
| **major** | The plant grows differently: a mutation, or a graft graduating in. Plants grown from the previous major are a different variety. |
| **minor** | New guidance that existing plants already satisfy. |
| **patch** | Clarification only — examples, wording, typos. |

**Graft packet**

| | Meaning |
| --- | --- |
| **major** | The union contract changes incompatibly. |
| **minor** | Additive. |
| **patch** | Fix. |

The rule underneath both: **major means the genetics changed.** A major bump is the only honest way to say "plants from here on are not the plants you had."

## Composition and compatibility

A graft packet declares the seed generations it can join:

```
stripe-union@0.3.1   requires aspnet-api@^1.2.0
```

So the bank is a compatibility graph, not a list. Two consequences:

1. **A mutation can invalidate grafts.** Bumping a seed's major version means every graft packet must be re-checked against the new genetics. This is the second reason mutations are plot-level rather than bed-level — they break attachments, not just beds.
2. **A graft cannot be applied to a seed it does not declare.** No implicit compatibility. If it hasn't been declared, it hasn't been tested.

## Pinning and provenance

A plant records the exact packet set it was grown from, in its journal:

```
seed:   aspnet-api@1.2.0
grafts: stripe-union@0.3.1, sentry-union@0.1.0
```

That pair — seed generation plus journal — is the plant's provenance. Anything that scaffolds from a seed must **pin** a generation; a plant grown from an unpinned seed is unreproducible, and every question about why it looks the way it does becomes unanswerable.

## Graduation

A graft graduates when the seed would have to mention it for the plant to be correct — when a plant *without* it is a different variety rather than an unfinished one.

Graduation folds the graft into the next seed generation:

```
aspnet-api@1.2.0  +  stripe-union@0.3.1
        ↓ graduation
aspnet-api@2.0.0   (includes the Stripe union)
```

The graft packet is then **superseded** and retired. It is no longer joined separately, because the genetics now carry it. Horticulturally, the variety has **come true** from seed.

Graduation is a major bump, because the plant genuinely grows differently afterwards: a leaf grown from v2 builds the union without being told to.

## Deferred: content hashing

**Semver is a claim; a hash is proof.**

The label says "this is generation 1.2.0" and nothing verifies it. A gardener can edit a packet in place and leave the label alone, and every plant grown from it afterwards will claim a provenance it does not have — while every plant grown *before* the edit will be misdescribed by the current file.

We are not adopting content hashing now. It becomes relevant in exactly one situation: **packets edited in place by people who do not know the generation rule** — the less experienced gardener, working without grafting. That is a real possibility, and the reason this section exists rather than being left out.

If it starts happening, hashing is the cheap remedy, and it belongs to the **groundskeeper**, not the seed: a mechanical check that content matches label, run at sow time and at dispatch. That is the same shape as *ripeness* — the claimant's self-report is evidence, not proof, and the mechanical check is what turns it into proof. We defer it because today the claimant is the person who wrote the rule.
