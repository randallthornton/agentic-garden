# Packets are semver-labelled and self-declared; hashing is deferred

Seeds and grafts are the same kind of artifact — **packets**: self-contained units of instructions handed to a leaf. Making them the same kind is what allows one to fold into the other. Each packet self-labels with semver, and the digits carry fixed meanings (major = the genetics changed, minor = additive, patch = clarification). A graft packet declares the seed generations it can join, so the seed bank is a compatibility graph rather than a folder.

We do not content-hash packets now. Semver is a claim and a hash is proof, and proof is only worth paying for when the claimant is untrusted. Editing packets in place — rather than releasing a generation — is the one scenario that changes that, and if it starts happening, hashing belongs to the groundskeeper as a mechanical check rather than to the seed as a feature.

**Consequences:** a mutation invalidates graft packets and must be re-checked, which is a second reason mutations are plot-level. Every plant pins its packet set in its journal. Graduation is a major bump and retires the graft packet it absorbs, because the plant genuinely grows differently afterwards.

**Considered options:** content hashing now (rejected: overhead with no claimant to distrust; deferred with a stated trigger); date-based versioning (rejected: says nothing about compatibility); no versioning at all (rejected: unpinned plants are unreproducible and their provenance is unanswerable).
