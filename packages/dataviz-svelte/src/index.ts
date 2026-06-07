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
export { default as BookmarkNavigator } from './lib/BookmarkNavigator.svelte';
export type { BookmarkNavigatorProps } from './lib/BookmarkNavigator.svelte';
export { default as CalculationEditor } from './lib/CalculationEditor.svelte';
export type { CalculationEditorProps } from './lib/CalculationEditor.svelte';
export { default as FormatPanel } from './lib/FormatPanel.svelte';
export type { FormatPanelProps } from './lib/FormatPanel.svelte';
export { default as SelectionLegend } from './lib/SelectionLegend.svelte';
export type { SelectionLegendProps } from './lib/SelectionLegend.svelte';
export { default as CrossfilteredBarChart } from './lib/CrossfilteredBarChart.svelte';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.svelte';
export { default as ParetoChart } from './lib/ParetoChart.svelte';
export type { ParetoChartProps } from './lib/ParetoChart.svelte';
export { default as DivergingBarChart } from './lib/DivergingBarChart.svelte';
export type { DivergingBarChartProps } from './lib/DivergingBarChart.svelte';
export { default as ComboChart } from './lib/ComboChart.svelte';
export type { ComboChartProps } from './lib/ComboChart.svelte';
export { default as StackedBarChart } from './lib/StackedBarChart.svelte';
export type { StackedBarChartProps } from './lib/StackedBarChart.svelte';
export { default as LollipopChart } from './lib/LollipopChart.svelte';
export type { LollipopChartProps } from './lib/LollipopChart.svelte';
export { default as StepLineChart } from './lib/StepLineChart.svelte';
export type { StepLineChartProps } from './lib/StepLineChart.svelte';
export { default as AreaChart } from './lib/AreaChart.svelte';
export type { AreaChartProps } from './lib/AreaChart.svelte';
export { default as DonutChart } from './lib/DonutChart.svelte';
export type { DonutChartProps } from './lib/DonutChart.svelte';
export { default as FunnelChart } from './lib/FunnelChart.svelte';
export type { FunnelChartProps } from './lib/FunnelChart.svelte';
export { default as WaterfallChart } from './lib/WaterfallChart.svelte';
export type { WaterfallChartProps } from './lib/WaterfallChart.svelte';
export { default as TreemapChart } from './lib/TreemapChart.svelte';
export type { TreemapChartProps } from './lib/TreemapChart.svelte';
export { default as SunburstChart } from './lib/SunburstChart.svelte';
export type { SunburstChartProps } from './lib/SunburstChart.svelte';
export { default as SankeyChart } from './lib/SankeyChart.svelte';
export type { SankeyChartProps } from './lib/SankeyChart.svelte';
export { default as RadarChart } from './lib/RadarChart.svelte';
export type { RadarChartProps } from './lib/RadarChart.svelte';
export { default as HistogramChart } from './lib/HistogramChart.svelte';
export type { HistogramChartProps } from './lib/HistogramChart.svelte';
export { default as BoxPlotChart } from './lib/BoxPlotChart.svelte';
export type { BoxPlotChartProps } from './lib/BoxPlotChart.svelte';
export { default as HeatmapChart } from './lib/HeatmapChart.svelte';
export type { HeatmapChartProps } from './lib/HeatmapChart.svelte';
export { default as CalendarHeatmapChart } from './lib/CalendarHeatmapChart.svelte';
export type { CalendarHeatmapChartProps } from './lib/CalendarHeatmapChart.svelte';
export { default as BulletChart } from './lib/BulletChart.svelte';
export type { BulletChartProps } from './lib/BulletChart.svelte';
export { default as GaugeChart } from './lib/GaugeChart.svelte';
export type { GaugeChartProps } from './lib/GaugeChart.svelte';
export { default as SmallMultiples } from './lib/SmallMultiples.svelte';
export type { SmallMultiplesProps } from './lib/SmallMultiples.svelte';
export { default as FieldPane } from './lib/FieldPane.svelte';
export type { FieldPaneProps } from './lib/FieldPane.svelte';
export { default as PivotDataTable } from './lib/PivotDataTable.svelte';
export type { PivotDataTableProps } from './lib/PivotDataTable.svelte';
export { default as AdvancedPivotDataTable } from './lib/AdvancedPivotDataTable.svelte';
export type { AdvancedPivotDataTableProps } from './lib/AdvancedPivotDataTable.svelte';
export { default as KpiCardGroup } from './lib/KpiCardGroup.svelte';
export type { KpiCardGroupProps } from './lib/KpiCardGroup.svelte';
export { default as RecordsTable } from './lib/RecordsTable.svelte';
export type { RecordsTableProps } from './lib/RecordsTable.svelte';
export { default as DrillBarChart } from './lib/DrillBarChart.svelte';
export type { DrillBarChartProps } from './lib/DrillBarChart.svelte';
export { default as DrillBreadcrumb } from './lib/DrillBreadcrumb.svelte';
export type { DrillBreadcrumbProps } from './lib/DrillBreadcrumb.svelte';
export { default as TopNFilter } from './lib/TopNFilter.svelte';
export type { TopNFilterProps } from './lib/TopNFilter.svelte';
export { default as ValueSlicer } from './lib/ValueSlicer.svelte';
export type { ValueSlicerProps } from './lib/ValueSlicer.svelte';
export { default as ExportMenu, rowsToCsv } from './lib/ExportMenu.svelte';
export type { ExportMenuProps } from './lib/ExportMenu.svelte';
export { default as DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.svelte';
export type { DateRangeFilterProps } from './lib/DateRangeFilter.svelte';
export {
  default as RelativeDateFilter,
  relativeRangeToSpec,
  DEFAULT_RELATIVE_PRESETS,
} from './lib/RelativeDateFilter.svelte';
export type { RelativeDateFilterProps, RelativeDatePreset } from './lib/RelativeDateFilter.svelte';
export {
  default as RangeSliderFilter,
  numericDomain,
  rangeBoundsToSpec,
} from './lib/RangeSliderFilter.svelte';
export type { RangeSliderFilterProps, NumericDomain } from './lib/RangeSliderFilter.svelte';
