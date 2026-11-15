# The distribution seed bank

Packets here are distributable varieties. To use one in a plot, copy its directory into the plot's local bank:

```bash
cp -r seeds/angular-spa .garden/seeds/angular-spa
```

A plot's canonical bank is `.garden/seeds/` (and `.garden/grafts/` for unions). This directory is the framework's distribution bank, not a plot's runtime bank.

Packets are immutable and semver-labelled. When the genetics change, release a new generation; do not edit an old one in place.
