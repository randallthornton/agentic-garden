# Gardening as the framework's operating metaphor

We are organising an agentic software engineering framework around cultivation rather than construction: seeds, soil, germination, tending, harvest, seed saving. The alternative — construction language (blueprints, scaffolds, builders, specs) — is the industry default and would need no explanation, but it encodes the wrong assumptions for agent-written code: that artefacts are inert, that plans precede work, and that "done" is a state. Cultivation language encodes the assumptions we actually rely on — substrate quality dominates instruction quality, verification is a gate rather than a promise, and improvement compounds only if each cycle feeds the next.

**Consequences:** the vocabulary is opinionated and must be enforced by `GLOSSARY.md` (one name per concept, competing terms listed under `_Avoid_`). The metaphor must be treated as a design language with documented limits (`docs/analogy.md` §6), not as a cosmology. Terms are only adopted where they name a practice that would otherwise be skipped or under-specified.

**Considered options:** plain software vocabulary (rejected: no memory aids, no pressure against one-shot prompting); construction vocabulary (rejected: wrong assumptions, see above); no metaphor at all (rejected: the framework's value is partly in being memorable enough to be followed under time pressure).
