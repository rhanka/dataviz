/**
 * Cross-filter / brushing-and-linking.
 *
 * The {@link CrossfilterGraph} declares, for each *source* view, the set of
 * *target* views its selection should filter. This is the classic crossfilter
 * pattern: selecting a bar in view A narrows views B and C, but A itself is
 * **not** filtered by its own selection (so you can keep refining it).
 *
 * Selections live in the store as `viewId -> selected keys`. Each view must
 * also declare which data field (dimension id) its keys refer to, so a
 * selection can be turned into a row predicate. That mapping is part of the
 * graph (`views[viewId].field`).
 */

import type { Cell, Row } from './model.js';
import type { DashboardState } from './store.js';
import { applyFilters } from './store.js';

/** Declaration of a single view participating in cross-filtering. */
export interface CrossfilterView {
  /** The dimension id this view's selection keys refer to. */
  field: string;
  /**
   * The view ids this view's selection filters. If omitted, defaults to
   * "every other view" (a fully-linked dashboard). An empty array means the
   * view's selection affects no other view.
   */
  affects?: string[];
}

/** Declarative scope: which view filters which. */
export interface CrossfilterGraph {
  views: Record<string, CrossfilterView>;
}

/** Stringify a cell the same way selections/groupBy keys are produced. */
function keyOf(value: Cell): string {
  return value == null ? 'null' : String(value);
}

/**
 * Resolve the set of source views whose selection should be applied to
 * `targetViewId`, honouring the declared scope and self-exclusion.
 */
export function sourcesFor(graph: CrossfilterGraph, targetViewId: string): string[] {
  const allViews = Object.keys(graph.views);
  const sources: string[] = [];
  for (const sourceId of allViews) {
    if (sourceId === targetViewId) continue; // a view never filters itself
    const view = graph.views[sourceId]!;
    const affects = view.affects ?? allViews.filter((v) => v !== sourceId);
    if (affects.includes(targetViewId)) {
      sources.push(sourceId);
    }
  }
  return sources;
}

/**
 * Compute the rows visible to a given view.
 *
 * Order of operations:
 *   1. Apply all dimension filters from `state.filters` (global slicers).
 *   2. Apply the selection of every *other* view that, per the graph, affects
 *      this view. The view's own selection is ignored (self-exclusion).
 *
 * When `viewId` is omitted, only the global dimension filters are applied
 * (useful for "what's the unscoped, globally-filtered dataset").
 */
export function applyCrossfilter(
  state: DashboardState,
  data: readonly Row[],
  viewId?: string,
  graph?: CrossfilterGraph,
): Row[] {
  let rows = applyFilters(state, data);

  if (!viewId || !graph) return rows;

  const sources = sourcesFor(graph, viewId);
  for (const sourceId of sources) {
    const selectedKeys = state.selections[sourceId];
    if (!selectedKeys || selectedKeys.length === 0) continue;
    const sourceView = graph.views[sourceId];
    if (!sourceView) continue;
    const field = sourceView.field;
    const wanted = new Set(selectedKeys);
    rows = rows.filter((row) => wanted.has(keyOf(row[field] ?? null)));
  }

  return rows;
}
