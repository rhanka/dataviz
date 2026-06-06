/**
 * @sentropic/dataviz-react
 *
 * React adapter + dashboard components for @sentropic/dataviz-core, built on
 * @sentropic/design-system-react. The adapter wires the core's observable store
 * onto React (`useSyncExternalStore`); the components compose design-system
 * presentational pieces and bind them to the shared dashboard state. No
 * presentation is authored here — it all comes from the design system.
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Dashboard components (state consumers built on the design system).
export { DashboardFilterBar } from './lib/DashboardFilterBar.js';
export type { DashboardFilterBarProps } from './lib/DashboardFilterBar.js';
export { SelectionLegend } from './lib/SelectionLegend.js';
export type { SelectionLegendProps } from './lib/SelectionLegend.js';
export { CrossfilteredBarChart } from './lib/CrossfilteredBarChart.js';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.js';
