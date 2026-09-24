# `@sentropic/dataviz-angular`

Angular adapter for `@sentropic/dataviz-core`, built against
`@sentropic/design-system-angular`.

> The `@sentropic/dataviz-*` libraries now live in and are published from the
> design system: <https://github.com/rhanka/sent-tech-design-system>. The copy
> in this repository is kept for the local site and demos only; it is private and
> this repository publishes nothing to npm.

This workspace package is private. It depends on a vendored
`@sentropic/design-system-angular@0.36.47` tarball because the DS Angular
package is not published to npm yet.

Current scope is intentionally narrow:

- signal-based bridge for the core dashboard store
- `QueryBar`
- `DateHistogramChart`

## Current packaging seam

`@sentropic/design-system-angular@0.36.47` contains real Angular `Search` and
`BarChart` DOM for the dataviz `QueryBar` and `DateHistogramChart` wrappers.
Consumers must load the DS CSS once:

```ts
import '@sentropic/design-system-angular/styles.css';
```

Replacing the `file:../../vendor/...` dependency with a published DS version, and
publishing this adapter at all, are now decisions owned by the design system
repository. Nothing in this repository should be made publishable again.
