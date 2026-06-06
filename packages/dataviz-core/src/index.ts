/**
 * @sentropic/dataviz-core
 *
 * Framework-agnostic engine for the shared inter-view state of a BI dashboard:
 * data model, observable immutable store, cross-filter graph, aggregation and
 * bookmark serialisation. Zero framework / design-system dependencies.
 */

// Model
export type {
  Cell,
  Row,
  DimensionType,
  Aggregation,
  Dimension,
  Measure,
  DataModel,
} from './model.js';
export {
  isDimensionType,
  isAggregation,
  isDimension,
  isMeasure,
  isDataModel,
  validateModel,
  assertModel,
  findDimension,
  findMeasure,
} from './model.js';

// Fields / field pane
export type {
  FieldKind,
  FieldId,
  FieldPillTone,
  FieldDescriptor,
  FieldPaneNode,
  FieldPaneTree,
  FieldPaneOptions,
  FieldPillModel,
} from './fields.js';
export {
  fieldId,
  parseFieldId,
  listFields,
  buildFieldPaneTree,
  fieldToPill,
} from './fields.js';

// Descriptions
export { describeFilterSpec } from './describe.js';

// Pivot / matrix
export type {
  PivotConfig,
  PivotTableColumn,
  PivotTableRow,
  PivotTable,
} from './pivot.js';
export { buildPivotTable } from './pivot.js';

// KPI cards
export type {
  KpiCardConfig,
  KpiBuildOptions,
  KpiSparklinePoint,
  KpiCard,
} from './kpi.js';
export { buildKpiCards } from './kpi.js';

// Categorical/combo series
export type {
  CategoricalMark,
  CategoricalAxis,
  CategoricalMode,
  CategoricalMeasureInput,
  CategoricalSeriesConfig,
  CategoricalMeasure,
  CategoricalSeries,
  CategoricalSeriesModel,
} from './categorical.js';
export { buildCategoricalSeries } from './categorical.js';

// Part-of-whole / flow
export type {
  PartWholeSort,
  PartWholeConfig,
  PartWholeItem,
  PartWholeModel,
  PartWholeHierarchyConfig,
  PartWholeNode,
  WaterfallConfig,
  WaterfallStep,
  WaterfallModel,
  FlowConfig,
  FlowNode,
  FlowLink,
  FlowModel,
} from './partOfWhole.js';
export {
  buildPartWholeModel,
  buildPartWholeHierarchy,
  buildWaterfallModel,
  buildFlowModel,
} from './partOfWhole.js';

// Distribution / statistics
export type {
  HistogramConfig,
  HistogramBin,
  HistogramModel,
  BoxPlotConfig,
  BoxPlotGroup,
  BoxPlotModel,
  HeatmapConfig,
  HeatmapCell,
  HeatmapModel,
} from './distribution.js';
export {
  buildHistogramModel,
  buildBoxPlotModel,
  buildHeatmapModel,
} from './distribution.js';

// Advanced pivot / matrix
export type {
  AdvancedPivotConfig,
  AdvancedPivotSparklinePoint,
  AdvancedPivotCell,
  AdvancedPivotRow,
  AdvancedPivotTable,
} from './pivotAdvanced.js';
export { buildAdvancedPivotTable } from './pivotAdvanced.js';

// Analytic overlays
export type {
  ReferenceLineConfig,
  ReferenceLineModel,
  PercentileBandConfig,
  PercentileBandModel,
  TrendLineConfig,
  TrendPoint,
  TrendLineModel,
  ForecastConfig,
  ForecastModel,
  ErrorBarsConfig,
  ErrorBarItem,
  ErrorBarsModel,
  AnalyticsClusterConfig,
  AnalyticsCluster,
  AnalyticsClusterModel,
} from './analytics.js';
export {
  buildReferenceLineModel,
  buildPercentileBandModel,
  buildTrendLineModel,
  buildForecastModel,
  buildErrorBarsModel,
  buildAnalyticsClusterModel,
} from './analytics.js';

// Geographic models
export type {
  GeoCoordinate,
  GeoPointConfig,
  GeoPoint,
  GeoPointModel,
  ChoroplethConfig,
  ChoroplethRegion,
  ChoroplethModel,
  GeoFlowConfig,
  GeoFlowLink,
  GeoFlowModel,
  GeoHexbinConfig,
  GeoHexbin,
  GeoHexbinModel,
  GeoClusterConfig,
  GeoCluster,
  GeoClusterModel,
} from './geo.js';
export {
  buildGeoPointModel,
  buildChoroplethModel,
  buildGeoFlowModel,
  buildGeoHexbinModel,
  buildGeoClusterModel,
} from './geo.js';

// Store
export type {
  FilterSpec,
  FilterState,
  SelectionState,
  DrillState,
  DashboardState,
  DashboardStoreConfig,
  DashboardStore,
} from './store.js';
export { createDashboardStore, specToPredicate, applyFilters, isFilterSpec } from './store.js';

// Crossfilter
export type { CrossfilterView, CrossfilterGraph } from './crossfilter.js';
export { sourcesFor, applyCrossfilter } from './crossfilter.js';

// Aggregate
export {
  groupBy,
  aggregate,
  aggregateValues,
  extractNumbers,
  groupAggregate,
} from './aggregate.js';

// Serialize
export {
  serializeFilters,
  deserializeFilters,
  serializeDrill,
  deserializeDrill,
} from './serialize.js';
