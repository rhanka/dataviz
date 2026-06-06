/**
 * Distribution and statistical chart data contracts.
 *
 * These builders cover rendering-neutral inputs for histograms, box plots and
 * categorical/calendar heatmaps.
 */

import { aggregate, extractNumbers } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';

export interface HistogramConfig {
  value: string;
  bins?: number;
  domain?: readonly [number, number];
}

export interface HistogramBin {
  index: number;
  x0: number;
  x1: number;
  count: number;
}

export interface HistogramModel {
  valueId: string;
  domain: [number, number];
  bins: HistogramBin[];
}

export interface BoxPlotConfig {
  value: string;
  group?: string;
}

export interface BoxPlotGroup {
  key: string;
  label: string;
  count: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

export interface BoxPlotModel {
  valueId: string;
  groups: BoxPlotGroup[];
}

export interface HeatmapConfig {
  x: string;
  y: string;
  measure: string;
}

export interface HeatmapCell {
  xKey: string;
  yKey: string;
  value: number;
}

export interface HeatmapModel {
  xKeys: string[];
  yKeys: string[];
  cells: HeatmapCell[];
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function assertDimension(model: DataModel, id: string, role: string): void {
  if (!findDimension(model, id)) {
    throw new Error(`Unknown ${role} dimension: ${id}`);
  }
}

function assertValueField(model: DataModel, id: string, role: string): void {
  if (!findMeasure(model, id) && !findDimension(model, id)) {
    throw new Error(`Unknown ${role} value field: ${id}`);
  }
}

function resolveMeasure(model: DataModel, id: string, role: string): Measure {
  const measure = findMeasure(model, id);
  if (!measure) {
    throw new Error(`Unknown ${role} measure: ${id}`);
  }
  return measure;
}

function uniqueKeys(rows: readonly Row[], field: string): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const row of rows) {
    const key = cellKey(row[field]);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  return keys;
}

function groupRows(rows: readonly Row[], field: string): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = cellKey(row[field]);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
}

export function buildHistogramModel(
  model: DataModel,
  data: readonly Row[],
  config: HistogramConfig,
): HistogramModel {
  assertValueField(model, config.value, 'histogram');
  const binCount = config.bins ?? 10;
  if (!Number.isInteger(binCount) || binCount <= 0) {
    throw new Error('Histogram bins must be a positive integer');
  }

  const values = extractNumbers([...data], config.value);
  if (values.length === 0) {
    return { valueId: config.value, domain: [Number.NaN, Number.NaN], bins: [] };
  }

  const min = config.domain?.[0] ?? Math.min(...values);
  const max = config.domain?.[1] ?? Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new Error('Histogram domain must be finite and ordered');
  }

  if (min === max) {
    return {
      valueId: config.value,
      domain: [min, max],
      bins: [{ index: 0, x0: min, x1: max, count: values.length }],
    };
  }

  const width = (max - min) / binCount;
  const counts = Array.from({ length: binCount }, () => 0);

  for (const value of values) {
    if (value < min || value > max) continue;
    const index = Math.min(Math.floor((value - min) / width), binCount - 1);
    counts[index] += 1;
  }

  return {
    valueId: config.value,
    domain: [min, max],
    bins: counts.map((count, index) => ({
      index,
      x0: min + index * width,
      x1: index === binCount - 1 ? max : min + (index + 1) * width,
      count,
    })),
  };
}

function quantile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const rest = position - base;
  const current = sorted[base]!;
  const next = sorted[base + 1] ?? current;
  return current + rest * (next - current);
}

function boxGroup(key: string, rows: readonly Row[], valueField: string): BoxPlotGroup {
  const values = extractNumbers([...rows], valueField).sort((a, b) => a - b);
  const min = values[0] ?? Number.NaN;
  const max = values[values.length - 1] ?? Number.NaN;
  const q1 = quantile(values, 0.25);
  const median = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  return {
    key,
    label: key,
    count: values.length,
    min,
    q1,
    median,
    q3,
    max,
    outliers: values.filter((value) => value < lowerFence || value > upperFence),
  };
}

export function buildBoxPlotModel(
  model: DataModel,
  data: readonly Row[],
  config: BoxPlotConfig,
): BoxPlotModel {
  assertValueField(model, config.value, 'box plot');
  if (config.group !== undefined) {
    assertDimension(model, config.group, 'box plot group');
  }

  const groups =
    config.group === undefined
      ? [boxGroup('All', data, config.value)]
      : Array.from(groupRows(data, config.group), ([key, rows]) => boxGroup(key, rows, config.value));

  return { valueId: config.value, groups };
}

export function buildHeatmapModel(
  model: DataModel,
  data: readonly Row[],
  config: HeatmapConfig,
): HeatmapModel {
  assertDimension(model, config.x, 'heatmap x');
  assertDimension(model, config.y, 'heatmap y');
  const measure = resolveMeasure(model, config.measure, 'heatmap');

  const xKeys = uniqueKeys(data, config.x);
  const yKeys = uniqueKeys(data, config.y);
  const cells: HeatmapCell[] = [];

  for (const yKey of yKeys) {
    for (const xKey of xKeys) {
      cells.push({
        xKey,
        yKey,
        value: aggregate(
          [...data].filter((row) => cellKey(row[config.x]) === xKey && cellKey(row[config.y]) === yKey),
          measure,
        ),
      });
    }
  }

  return { xKeys, yKeys, cells };
}
