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
  ParetoConfig,
  ParetoItem,
  ParetoModel,
  DivergingDirection,
  DivergingBarConfig,
  DivergingBarItem,
  DivergingBarModel,
} from './categorical.js';
export {
  buildCategoricalSeries,
  buildParetoModel,
  buildDivergingBarModel,
} from './categorical.js';

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
  RadarConfig,
  RadarAxis,
  RadarPoint,
  RadarSeries,
  RadarModel,
  RoseConfig,
  RoseSector,
  RoseModel,
  MekkoConfig,
  MekkoSegment,
  MekkoColumn,
  MekkoModel,
  PackedBubbleConfig,
  PackedBubble,
  PackedBubbleModel,
} from './partOfWhole.js';
export {
  buildPartWholeModel,
  buildPartWholeHierarchy,
  buildWaterfallModel,
  buildFlowModel,
  buildRadarModel,
  buildRoseModel,
  buildMekkoModel,
  buildPackedBubbleModel,
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
  BulletChartConfig,
  BulletChartDatum,
  BulletChartModel,
  GaugeChartTone,
  GaugeChartFormat,
  GaugeChartThreshold,
  GaugeChartConfig,
  GaugeChartModel,
} from './distribution.js';
export {
  buildHistogramModel,
  buildBoxPlotModel,
  buildHeatmapModel,
  buildBulletChartModel,
  buildGaugeChartModel,
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

// Scatter plot model
export type { ScatterDatum, ScatterConfig, ScatterModel, ScatterTone } from './scatter.js';
export { buildScatterModel } from './scatter.js';

// Candlestick chart model
export type { CandlestickDatum, CandlestickConfig } from './candlestick.js';
export { buildCandlestickData } from './candlestick.js';

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
  GeoDensityConfig,
  GeoBounds,
  GeoDensityCell,
  GeoDensityModel,
  GeoJsonGeometryType,
  GeoJsonGeometry,
  GeoJsonLayerConfig,
  GeoJsonFeature,
  GeoJsonLayerModel,
} from './geo.js';
export {
  buildGeoPointModel,
  buildChoroplethModel,
  buildGeoFlowModel,
  buildGeoHexbinModel,
  buildGeoClusterModel,
  buildGeoDensityModel,
  buildGeoJsonLayerModel,
} from './geo.js';

// Format / axes
export type {
  FormatAxisScale,
  FormatMarkerShape,
  FormatAxisConfig,
  FormatLegendConfig,
  FormatMarkerConfig,
  FormatPanelConfig,
  FormatAxis,
  FormatLegend,
  FormatMarker,
  FormatPanelState,
  FormatAxisPatch,
  FormatLegendPatch,
  FormatMarkerPatch,
} from './format.js';
export {
  createFormatPanelState,
  updateAxisFormat,
  updateLegendFormat,
  updateMarkerFormat,
} from './format.js';

// Annotations
export type {
  AnnotationCoordinate,
  AnnotationMarker,
  AnnotationAnchor,
  AnnotationAxis,
  AnnotationPoint,
  PointAnnotation,
  LabelAnnotation,
  LineAnnotation,
  RegionAnnotation,
  ShapeAnnotation,
  ChartAnnotation,
} from './annotations.js';
export {
  isChartAnnotation,
  pointAnnotation,
  labelAnnotation,
  lineAnnotation,
  regionAnnotation,
  shapeAnnotation,
  annotation,
  serializeAnnotations,
  deserializeAnnotations,
} from './annotations.js';

// Value formatting (Intl)
export type {
  FormatValueStyle,
  FormatValueNotation,
  FormatValueDateStyle,
  FormatValueOptions,
} from './format-value.js';
export { formatValue, makeFormatter, FORMAT_VALUE_FALLBACK } from './format-value.js';

// Calculations / expressions
export type {
  CalculationVariable,
  CalculatedFieldKind,
  CalculatedFieldConfig,
  CalculationSuggestionKind,
  CalculationSuggestion,
  CalculationBinConfig,
  CalculationGroup,
  CalculationGroupConfig,
  CalculationSetConfig,
  TableCalculationKind,
} from './calculations.js';
export {
  evaluateCalculationExpression,
  applyCalculatedFields,
  extendModelWithCalculatedFields,
  suggestCalculationTokens,
  applyCalculationBins,
  applyCalculationGroups,
  applyCalculationSet,
  calculateTableValues,
} from './calculations.js';

// Dashboard objects / layers
export type {
  DashboardObjectLayerKind,
  WebFrameLoading,
  WebFrameReferrerPolicy,
  WebFrameSandboxToken,
  WebFrameConfig,
  ResolvedWebFrame,
  DataImageConfig,
  ResolvedDataImage,
  DashboardObjectLayer,
  ObjectLayerTreeNode,
  ObjectLayerTree,
  ObjectLayerPanelState,
} from './objects.js';
export {
  isObjectLayerVisible,
  buildObjectLayerTree,
  createObjectLayerPanelState,
  selectObjectLayer,
  setObjectLayerVisibility,
  toggleObjectLayerVisibility,
  resolveWebFrame,
  resolveDataImage,
} from './objects.js';

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

// Bookmarks / actions
export type {
  DashboardActionRuntime,
  DashboardBookmark,
  DashboardAction,
} from './actions.js';
export {
  resolveDashboardBookmarkState,
  applyDashboardBookmark,
  runDashboardAction,
} from './actions.js';

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
  serializeState,
  deserializeState,
} from './serialize.js';

// Hover channel (ephemeral cross-panel crosshair state — not serialised)
export type { HoverChannel } from './hover.js';
export { createHoverChannel, hoverKeyOf } from './hover.js';

// Conditional formatting (serialisable rule engine; presentation-free)
export type {
  ConditionalComparator,
  ConditionalIntent,
  ComparatorCondition,
  RankCondition,
  ConditionalCondition,
  ConditionalRule,
  ConditionalFormat,
  ConditionalDecoration,
} from './conditional-format.js';
export {
  isConditionalRule,
  isConditionalFormat,
  evaluateConditionalFormat,
  applyConditionalFormat,
  rule,
  rankRule,
} from './conditional-format.js';

// Dashboard layout (serialisable grid panel layout; presentation-free)
export type { PanelLayout, DashboardLayout, LayoutState } from './layout.js';
export {
  isPanelLayout,
  isDashboardLayout,
  createLayout,
  addPanel,
  removePanel,
  movePanel,
  resizePanel,
  normalizeLayout,
  serializeLayout,
  deserializeLayout,
  createLayoutState,
} from './layout.js';
