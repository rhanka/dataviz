# WP15 DS handoff

Context: after `v0.4.17`, DS audit confirmed that analytics and geo SVG fallbacks in dataviz are functional coverage only, not acceptable final presentation. Dataviz has consumed every currently published DS surface that fits without changing behavior.

## Done in dataviz

- `ReferenceLineChart`: React/Svelte/Vue now render DS `LineChart` with `referenceLines`.
- `PercentileBandChart`: React/Svelte/Vue now render DS `LineChart` with `bands` plus a median `referenceLine`.
- `TrendLineChart`: React/Svelte/Vue now render DS `LineChart` with `trend`.
- `ErrorBarsChart`: React/Svelte/Vue now render DS `BarChart` with `errorLow`/`errorHigh`.
- Package and demo app dependencies are aligned to DS React/Vue `0.26.1` and Svelte `0.30.1`.

## Still blocked on DS surfaces

- `ForecastLineChart`: dataviz still has a temporary SVG fallback because published DS `LineChart` has no native forecast/dashed segment mode. Required DS surface: line chart forecast segment/series with dashed styling and tokenized forecast tone.
- `AnalyticsClusterPlot`: dataviz still has a temporary SVG fallback because published DS `ScatterPlot` does not expose per-datum radius/size or cluster centroid markers. Required DS surface: either `ClusterPlot` or `ScatterPlot` with per-datum radius, cluster tone, and centroid marker support.
- Geo maps: all 7 geo wrappers still have temporary SVG fallbacks because no published DS 2D map surface exists. Required DS surface: either a generic `GeoMap` with layers or dedicated `GeoPointMap`, `ChoroplethMap`, `GeoFlowMap`, `GeoHexbinMap`, `GeoClusterMap`, `GeoDensityMap`, `GeoJsonMap`, each available in React/Svelte/Vue.

## Verification

- `npm run check`
- `npm run build`
- `npm run test`
