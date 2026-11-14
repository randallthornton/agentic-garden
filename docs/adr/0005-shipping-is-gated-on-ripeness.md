# Shipping is gated on ripeness, not on a leaf's report of done

An agent's "done" is self-reported and self-certified. A definition of done is a checklist, and a checklist can be satisfied by the very party being checked — agents learn to satisfy the checklist rather than the outcome. We therefore remove "done" from the framework and gate shipping on **ripeness**: three independent checks from three parties — soundness (groundskeeper), fit (assistant), value (gardener) — none of which is the leaf that did the work.

**Consequences:** a leaf's completion report is evidence, not proof. Every seed must state what soundness, fit, and value mean at the growth stage it targets, because the checks are stage-dependent. The gardener is the only party who can judge value, so removing the gardener from the loop removes the value check — this is the concrete cost of "gardener outside the loop", and the reason that role is a gate rather than a bottleneck.

**Considered options:** definition of done (rejected: self-certifiable, and optimised against rather than satisfied); leaf self-report plus CI (rejected: no fit or value check, so plausible-but-wrong work passes); human review of everything (rejected: the gardener enters the loop and becomes the bottleneck, which is the failure this framework exists to avoid).
