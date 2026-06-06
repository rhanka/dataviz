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

import type { Cell, DataModel, Row } from './model.js';
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

/** Accepted argument to {@link DashboardStore.setFilter}. */
export type FilterInput = FilterSpec | ((value: Cell, row: Row) => boolean);

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
  /** Remove the filter on a dimension. No-op if absent. */
  clearFilter(dimensionId: string): void;
  /** Toggle a single selected key for a view. */
  toggleSelection(viewId: string, key: string): void;
  /** Clear all selections for a view. No-op if absent. */
  clearSelection(viewId: string): void;
  /** Reset all filters and selections. */
  clearAll(): void;
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
  const data: readonly Row[] = Object.freeze([...config.data]);

  function notify(): void {
    for (const listener of [...listeners]) {
      listener();
    }
  }

  function commit(next: DashboardState): void {
    state = next;
    notify();
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
      const nextFilters: FilterState = { ...state.filters, [dimensionId]: spec };
      commit(freezeState(nextFilters, state.selections));
    },

    clearFilter(dimensionId: string) {
      if (!(dimensionId in state.filters)) return;
      const nextFilters: FilterState = { ...state.filters };
      delete nextFilters[dimensionId];
      commit(freezeState(nextFilters, state.selections));
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
  };
}

/** Compile a {@link FilterSpec} into a runtime predicate over a cell. */
export function specToPredicate(spec: FilterSpec): (value: Cell) => boolean {
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
        if (value == null || value === '') return false;
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
  if (entries.length === 0) return [...data];
  const predicates = entries.map(
    ([dimensionId, spec]) => [dimensionId, specToPredicate(spec)] as const,
  );
  return data.filter((row) => predicates.every(([dimId, pred]) => pred(row[dimId] ?? null)));
}
