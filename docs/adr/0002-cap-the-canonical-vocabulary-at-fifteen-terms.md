**Status:** superseded by ADR-0004.

# Canonical vocabulary capped at fifteen terms

The gardening vocabulary is generative — it produced roughly eighty usable terms in one pass — but a glossary nobody reads twice is worse than no glossary, and terms that nothing depends on dilute the ones that matter. We therefore fix `GLOSSARY.md` at fifteen canonical terms and park everything else in `docs/lexicon.md`, where a term may be promoted only when a practice needs a name for it.

**Consequences:** core documents may use parked words, but no practice, seed, or tool may *depend* on one. Adding a sixteenth canonical term requires removing one, which forces the argument about which term is actually load-bearing.

**Considered options:** keep the full eighty-term glossary (rejected: unreadable, and it makes every term look equally binding); no glossary at all (rejected: without one name per concept the metaphor drifts into synonyms and stops doing work).
