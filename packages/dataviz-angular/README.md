# `@sentropic/dataviz-angular`

Angular adapter for `@sentropic/dataviz-core`, built against
`@sentropic/design-system-angular`.

This workspace package is private for now. It depends on a vendored
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

Once the DS Angular package is published to npm, remove `private: true`, replace
the `file:../../vendor/...` dependency with the published DS version, and add
the package to the npm publishing workflow.
