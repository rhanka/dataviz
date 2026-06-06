/**
 * @sentropic/dataviz-svelte
 *
 * Svelte 5 adapter + dashboard components for @sentropic/dataviz-core, built on
 * @sentropic/design-system-svelte. The adapter wires the core's observable store
 * onto Svelte reactivity; the components compose design-system presentational
 * pieces and bind them to the shared dashboard state. No presentation is
 * authored here — it all comes from the design system.
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Dashboard components (state consumers built on the design system).
export { default as DashboardFilterBar } from './lib/DashboardFilterBar.svelte';
export type { DashboardFilterBarProps } from './lib/DashboardFilterBar.svelte';
export { default as SelectionLegend } from './lib/SelectionLegend.svelte';
export type { SelectionLegendProps } from './lib/SelectionLegend.svelte';
export { default as CrossfilteredBarChart } from './lib/CrossfilteredBarChart.svelte';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.svelte';
export { default as PivotDataTable } from './lib/PivotDataTable.svelte';
export type { PivotDataTableProps } from './lib/PivotDataTable.svelte';
export { default as KpiCardGroup } from './lib/KpiCardGroup.svelte';
export type { KpiCardGroupProps } from './lib/KpiCardGroup.svelte';
