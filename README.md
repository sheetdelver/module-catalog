# Sheet Delver Module Catalog

This repository publishes Sheet Delver's official public module catalog at:

`https://sheetdelver.github.io/module-catalog/catalog.json`

## Adding Or Updating A Module

1. Add or update its entry in `site/catalog.json`.
2. Keep the module ID canonical and identical to the object key.
3. Point `manifest` at the public release asset named `sheet-delver-manifest.json`.
4. Run `npm test`.
5. Open a pull request. GitHub Pages deploys after the change reaches `main`.

Catalog entries describe stable discovery locations only. Version, digest,
compatibility, permissions, and artifact verification are supplied by each
module's generated release manifest. Trust is assigned by Sheet Delver source
policy and must not appear in this catalog.
