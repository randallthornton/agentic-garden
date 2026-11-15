# The distribution graft bank

Graft packets here describe unions between a plant grown from a seed and tissue whose genetics you do not control.

To use one in a plot, copy its directory into the plot's local graft bank:

```bash
cp -r grafts/tailwind-union .garden/grafts/tailwind-union
```

A graft declares the seed generations it can join via `requires`. It never edits the seed; it writes to the plant's journal. If the graft becomes part of how the variety is always grown, it graduates into a new seed generation.
