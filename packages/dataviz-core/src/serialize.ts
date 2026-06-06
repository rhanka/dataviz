/**
 * Bookmark / URL serialisation of the filter state.
 *
 * `serializeFilters` produces a compact, URL-safe string; `deserializeFilters`
 * parses it back into a {@link FilterState}, dropping any entry that does not
 * reference a known dimension or whose spec is malformed. The round-trip of a
 * valid state is guaranteed.
 *
 * Encoding: JSON of the filter map, then `encodeURIComponent`. Plain and
 * robust; the result is safe to drop into a query string. (We avoid base64 so
 * the value stays human-inspectable and dependency-free.)
 */

import type { DataModel } from './model.js';
import { findDimension } from './model.js';
import type { DrillState, FilterSpec, FilterState } from './store.js';
import { isFilterSpec } from './store.js';

/** Normalise a spec into a minimal, stable object for serialisation. */
function normaliseSpec(spec: FilterSpec): FilterSpec {
  if (spec.kind === 'include' || spec.kind === 'exclude') {
    return { kind: spec.kind, values: [...spec.values] };
  }
  const out: FilterSpec = { kind: 'range' };
  if (spec.min !== undefined) out.min = spec.min;
  if (spec.max !== undefined) out.max = spec.max;
  return out;
}

/**
 * Serialise the filter portion of a state to a URL-safe string.
 * Selections are intentionally *not* serialised here — they are ephemeral
 * brushing state, not part of a bookmark. (Bookmark = filters.)
 */
export function serializeFilters(state: { filters: FilterState }): string {
  const normalised: FilterState = {};
  for (const key of Object.keys(state.filters).sort()) {
    const spec = state.filters[key]!;
    if (!isFilterSpec(spec)) {
      throw new TypeError(`Cannot serialize malformed filter spec for dimension ${key}`);
    }
    normalised[key] = normaliseSpec(spec);
  }
  return encodeURIComponent(JSON.stringify(normalised));
}

/**
 * Parse a serialised filter string back to a {@link FilterState}, validating
 * against the model. Unknown dimensions and malformed specs are dropped. Any
 * parse error yields an empty state (never throws).
 */
export function deserializeFilters(encoded: string, model: DataModel): FilterState {
  if (!encoded) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return {};
  }
  if (typeof raw !== 'object' || raw === null) return {};

  const result: FilterState = {};
  for (const [dimensionId, spec] of Object.entries(raw as Record<string, unknown>)) {
    if (!findDimension(model, dimensionId)) continue; // unknown dimension
    if (!isFilterSpec(spec)) continue; // malformed spec
    result[dimensionId] = normaliseSpec(spec);
  }
  return result;
}

function isDrillPath(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string');
}

function normaliseDrillPath(path: readonly string[]): string[] {
  return [...path];
}

/**
 * Serialise the drill portion of a state to a URL-safe string.
 * Filters keep their existing bookmark channel; drill is separate so callers
 * can opt in when bookmark semantics include drill navigation.
 */
export function serializeDrill(state: { drill: DrillState }): string {
  const normalised: DrillState = {};
  for (const key of Object.keys(state.drill).sort()) {
    const path = state.drill[key]!;
    if (!isDrillPath(path)) {
      throw new TypeError(`Cannot serialize malformed drill path for view ${key}`);
    }
    normalised[key] = normaliseDrillPath(path);
  }
  return encodeURIComponent(JSON.stringify(normalised));
}

/**
 * Parse a serialised drill string back to a {@link DrillState}, validating
 * dimensions against the model. Unknown dimensions and malformed paths are
 * dropped. Any parse error yields an empty state.
 */
export function deserializeDrill(encoded: string, model: DataModel): DrillState {
  if (!encoded) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return {};
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};

  const result: DrillState = {};
  for (const [viewId, path] of Object.entries(raw as Record<string, unknown>)) {
    if (!isDrillPath(path)) continue;
    if (!path.every((dimensionId) => findDimension(model, dimensionId))) continue;
    result[viewId] = normaliseDrillPath(path);
  }
  return result;
}
