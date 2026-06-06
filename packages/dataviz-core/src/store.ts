/**
 * The dashboard store: an immutable, observable container for the shared
 * inter-view state (filters + selections).
 *
 * Every mutation produces a brand-new frozen {@link DashboardState} (a different
 * object reference) and then notifies subscribers. The state is fully
 * serialisable: filters are stored as declarative {@link FilterSpec}s rather
 * than as opaque functions, so they can be bookmarked / round-tripped through a
 * URL. A runtime predicate is derived from the spec on demand.
 */

import { findDimension } from './model.js';
import type { Cell, DataModel, Row } from './model.js';
import { applyCrossfilter as applyCrossfilterRows } from './crossfilter.js';
import type { CrossfilterGraph } from './crossfilter.js';

/**
 * A declarative, serialisable description of a filter on one dimension.
 *
 * - `include`: keep rows whose cell (stringified) is in `values`.
 * - `exclude`: drop rows whose cell (stringified) is in `values`.
 * - `range`: keep rows whose numeric cell is within `[min, max]` (inclusive,
 *   bounds optional).
 */
export type FilterSpec =
  | { kind: 'include'; values: string[] }
  | { kind: 'exclude'; values: string[] }
  | { kind: 'range'; min?: number; max?: number };

/** Map of dimensionId -> filter spec. Serialisable. */
export type FilterState = Record<string, FilterSpec>;

/** Map of viewId -> selected keys. Serialisable. */
export type SelectionState = Record<string, string[]>;

/** Immutable snapshot of the dashboard's shared state. */
export interface DashboardState {
  readonly filters: FilterState;
  readonly selections: SelectionState;
}

export interface DashboardStoreConfig {
  model: DataModel;
  data: Row[];
  crossfilter?: CrossfilterGraph;
}

export interface DashboardStore {
  /** Frozen snapshot of the current state. */
  getState(): DashboardState;
  /** The data model (read-only). */
  readonly model: DataModel;
  /** The raw, unfiltered data (read-only copy). */
  readonly data: readonly Row[];
  /** The cross-filter graph, if any. */
  readonly crossfilter?: CrossfilterGraph;
  /** Subscribe to changes. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /** Set (or replace) the filter on a dimension. */
  setFilter(dimensionId: string, spec: FilterSpec): void;
  /** Alias for clearing one filter, matching the public store contract. */
  clear(dimensionId: string): void;
  /** Remove the filter on a dimension. No-op if absent. */
  clearFilter(dimensionId: string): void;
  /** Toggle a single selected key for a view. */
  toggleSelection(viewId: string, key: string): void;
  /** Clear all selections for a view. No-op if absent. */
  clearSelection(viewId: string): void;
  /** Reset all filters and selections. */
  clearAll(): void;
  /** Apply global filters and this store's cross-filter graph for one view. */
  applyCrossfilter(viewId?: string): Row[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isFiniteBound(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Validate that an unknown value is a well-formed, serialisable {@link FilterSpec}. */
export function isFilterSpec(value: unknown): value is FilterSpec {
  if (typeof value !== 'object' || value === null) return false;
  const spec = value as Record<string, unknown>;
  switch (spec.kind) {
    case 'include':
    case 'exclude':
      return isStringArray(spec.values);
    case 'range':
      return (
        (spec.min === undefined || isFiniteBound(spec.min)) &&
        (spec.max === undefined || isFiniteBound(spec.max))
      );
    default:
      return false;
  }
}

function assertFilterSpec(spec: unknown): asserts spec is FilterSpec {
  if (!isFilterSpec(spec)) {
    throw new TypeError('Invalid filter spec');
  }
}

/** Build the empty initial state, frozen. */
function emptyState(): DashboardState {
  return Object.freeze({
    filters: Object.freeze({}) as FilterState,
    selections: Object.freeze({}) as SelectionState,
  });
}

/** Deep-freeze a filter spec so snapshots cannot be mutated in place. */
function freezeSpec(spec: FilterSpec): FilterSpec {
  if (spec.kind === 'include' || spec.kind === 'exclude') {
    return Object.freeze({ kind: spec.kind, values: Object.freeze([...spec.values]) }) as FilterSpec;
  }
  return Object.freeze({ kind: 'range', min: spec.min, max: spec.max }) as FilterSpec;
}

function freezeState(filters: FilterState, selections: SelectionState): DashboardState {
  const frozenFilters: FilterState = {};
  for (const [id, spec] of Object.entries(filters)) {
    frozenFilters[id] = freezeSpec(spec);
  }
  const frozenSelections: SelectionState = {};
  for (const [id, keys] of Object.entries(selections)) {
    frozenSelections[id] = Object.freeze([...keys]) as string[];
  }
  return Object.freeze({
    filters: Object.freeze(frozenFilters),
    selections: Object.freeze(frozenSelections),
  });
}

function freezeRow(row: Row): Row {
  return Object.freeze({ ...row }) as Row;
}

function cloneResultRows(rows: readonly Row[]): Row[] {
  return rows.map(freezeRow);
}

function arrayEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function specsEqual(a: FilterSpec | undefined, b: FilterSpec): boolean {
  if (!a || a.kind !== b.kind) return false;
  if (a.kind === 'include' || a.kind === 'exclude') {
    return arrayEqual(a.values, (b as typeof a).values);
  }
  const range = b as Extract<FilterSpec, { kind: 'range' }>;
  return a.min === range.min && a.max === range.max;
}

/**
 * Create an observable, immutable dashboard store.
 *
 * The store starts empty. Mutators copy-on-write: each produces a new frozen
 * state object and synchronously notifies listeners. Listeners are invoked even
 * if a snapshot is logically identical, only when an actual change happened
 * (no-op mutations such as clearing an absent filter do not notify).
 */
export function createDashboardStore(config: DashboardStoreConfig): DashboardStore {
  let state = emptyState();
  const listeners = new Set<() => void>();
  // Defensive copy: the store owns its data; callers can't mutate it later.
  const data: readonly Row[] = Object.freeze(config.data.map(freezeRow));

  function notify(): void {
    for (const listener of [...listeners]) {
      listener();
    }
  }

  function commit(next: DashboardState): void {
    state = next;
    notify();
  }

  function assertKnownDimension(dimensionId: string): void {
    if (!findDimension(config.model, dimensionId)) {
      throw new Error(`Unknown dimension: ${dimensionId}`);
    }
  }

  function clearFilterImpl(dimensionId: string): void {
    if (!(dimensionId in state.filters)) return;
    const nextFilters: FilterState = { ...state.filters };
    delete nextFilters[dimensionId];
    commit(freezeState(nextFilters, state.selections));
  }

  return {
    model: config.model,
    data,
    crossfilter: config.crossfilter,

    getState() {
      return state;
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    setFilter(dimensionId: string, spec: FilterSpec) {
      assertKnownDimension(dimensionId);
      assertFilterSpec(spec);
      if (specsEqual(state.filters[dimensionId], spec)) return;
      const nextFilters: FilterState = { ...state.filters, [dimensionId]: spec };
      commit(freezeState(nextFilters, state.selections));
    },

    clear(dimensionId: string) {
      clearFilterImpl(dimensionId);
    },

    clearFilter(dimensionId: string) {
      clearFilterImpl(dimensionId);
    },

    toggleSelection(viewId: string, key: string) {
      const current = state.selections[viewId] ?? [];
      const has = current.includes(key);
      const nextKeys = has ? current.filter((k) => k !== key) : [...current, key];
      const nextSelections: SelectionState = { ...state.selections };
      if (nextKeys.length === 0) {
        delete nextSelections[viewId];
      } else {
        nextSelections[viewId] = nextKeys;
      }
      commit(freezeState(state.filters, nextSelections));
    },

    clearSelection(viewId: string) {
      if (!(viewId in state.selections)) return;
      const nextSelections: SelectionState = { ...state.selections };
      delete nextSelections[viewId];
      commit(freezeState(state.filters, nextSelections));
    },

    clearAll() {
      const hasState =
        Object.keys(state.filters).length > 0 || Object.keys(state.selections).length > 0;
      if (!hasState) return;
      commit(emptyState());
    },

    applyCrossfilter(viewId?: string) {
      return applyCrossfilterRows(state, data, viewId, config.crossfilter);
    },
  };
}

/** Compile a {@link FilterSpec} into a runtime predicate over a cell. */
export function specToPredicate(spec: FilterSpec): (value: Cell) => boolean {
  assertFilterSpec(spec);
  switch (spec.kind) {
    case 'include': {
      const set = new Set(spec.values);
      return (value) => set.has(value == null ? 'null' : String(value));
    }
    case 'exclude': {
      const set = new Set(spec.values);
      return (value) => !set.has(value == null ? 'null' : String(value));
    }
    case 'range': {
      const { min, max } = spec;
      return (value) => {
        if (value == null || typeof value === 'boolean') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        const n = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(n)) return false;
        if (min !== undefined && n < min) return false;
        if (max !== undefined && n > max) return false;
        return true;
      };
    }
  }
}

/**
 * Apply only the *filter* portion of a state to a row set (ignoring the
 * cross-filter scope). Use {@link applyCrossfilter} for per-view results.
 */
export function applyFilters(state: DashboardState, data: readonly Row[]): Row[] {
  const entries = Object.entries(state.filters);
  if (entries.length === 0) return cloneResultRows(data);
  const predicates = entries.map(
    ([dimensionId, spec]) => [dimensionId, specToPredicate(spec)] as const,
  );
  return cloneResultRows(
    data.filter((row) => predicates.every(([dimId, pred]) => pred(row[dimId] ?? null))),
  );
}
