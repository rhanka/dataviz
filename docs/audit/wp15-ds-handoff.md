# WP15 DS handoff

Context: after `v0.4.17`, DS audit confirmed that analytics and geo SVG fallbacks in dataviz were functional coverage only, not acceptable final presentation. Dataviz has now consumed the DS surfaces published for WP15 and removed the presentation fallbacks.

## Done in dataviz

- `ReferenceLineChart`, `PercentileBandChart`, `TrendLineChart`, `ForecastLineChart`, `ErrorBarsChart` and `AnalyticsClusterPlot` use DS `LineChart`/`ScatterPlot`/`BarChart` in React/Svelte/Vue.
- `GeoPointMap`, `ChoroplethMap`, `GeoFlowMap`, `GeoHexbinMap`, `GeoClusterMap`, `GeoDensityMap` and `GeoJsonMap` use DS `GeoMap` in React/Svelte/Vue.
- Package and demo app dependencies are aligned to DS React/Vue `0.29.0` and Svelte `0.33.0`.
- Analytics and geo tests assert DS classes/layers and assert old fallback-only classes are absent.

## Contract note

- `ChoroplethMap` no longer draws an abstract local grid. It can pass values to DS `GeoMap` only for real region geometries, so the wrapper now accepts `geometry?: string`. Without a geometry field, the DS layer remains empty rather than falling back to presentation code.

## Verification

- `npm run verify`

## Closure

- WP15 is closed on the dataviz side once `v0.4.19` is published and DS is notified with the tag.
