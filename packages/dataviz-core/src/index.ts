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

// Store
export type {
  FilterSpec,
  FilterState,
  SelectionState,
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
export { serializeFilters, deserializeFilters } from './serialize.js';
