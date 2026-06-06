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
export { SmallMultiples } from './lib/SmallMultiples.js';
export type { SmallMultiplesProps } from './lib/SmallMultiples.js';
export { FieldPane } from './lib/FieldPane.js';
export type { FieldPaneProps } from './lib/FieldPane.js';
export { PivotDataTable } from './lib/PivotDataTable.js';
export type { PivotDataTableProps } from './lib/PivotDataTable.js';
export { KpiCardGroup } from './lib/KpiCardGroup.js';
export type { KpiCardGroupProps } from './lib/KpiCardGroup.js';
export { RecordsTable } from './lib/RecordsTable.js';
export type { RecordsTableProps } from './lib/RecordsTable.js';
export { DrillBarChart } from './lib/DrillBarChart.js';
export type { DrillBarChartProps } from './lib/DrillBarChart.js';
export { DrillBreadcrumb } from './lib/DrillBreadcrumb.js';
export type { DrillBreadcrumbProps } from './lib/DrillBreadcrumb.js';
export { TopNFilter } from './lib/TopNFilter.js';
export type { TopNFilterProps } from './lib/TopNFilter.js';
export { ValueSlicer } from './lib/ValueSlicer.js';
export type { ValueSlicerProps } from './lib/ValueSlicer.js';
export { ExportMenu, rowsToCsv } from './lib/ExportMenu.js';
export type { ExportMenuProps } from './lib/ExportMenu.js';
export { DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.js';
export type { DateRangeFilterProps } from './lib/DateRangeFilter.js';
export {
  RelativeDateFilter,
  relativeRangeToSpec,
  DEFAULT_RELATIVE_PRESETS,
} from './lib/RelativeDateFilter.js';
export type { RelativeDateFilterProps, RelativeDatePreset } from './lib/RelativeDateFilter.js';
export { RangeSliderFilter, numericDomain, rangeBoundsToSpec } from './lib/RangeSliderFilter.js';
export type { RangeSliderFilterProps, NumericDomain } from './lib/RangeSliderFilter.js';
