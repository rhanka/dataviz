# `@sentropic/dataviz-angular`

Angular adapter for `@sentropic/dataviz-core`, built against
`@sentropic/design-system-angular`.

This workspace package is private for now. It depends on a vendored
`@sentropic/design-system-angular@0.36.45` tarball because the DS Angular
package is not published to npm yet.

Current scope is intentionally narrow:

- signal-based bridge for the core dashboard store
- `QueryBar`
- `DateHistogramChart`

## Current upstream seam

`@sentropic/design-system-angular@0.36.45` currently exposes `Search` and
`BarChart` as standalone Angular wrappers whose templates are projection shells
only. This package therefore wires dataviz state, filtering, and selection into
those DS components, but it does not recreate the DS DOM internally.

That means the package is compile-safe and API-safe today, while full rendered
Angular parity remains blocked on upstream DS Angular implementations for those
two surfaces.

The local workspace depends on a vendored tarball of
`@sentropic/design-system-angular@0.36.45` because that package is not published
to npm yet. Once the DS Angular package is published and the upstream
`Search`/`BarChart` components render their own DOM, remove `private: true`,
replace the `file:../../vendor/...` dependency with `0.36.45`, and add the
package to the npm publishing workflow.
