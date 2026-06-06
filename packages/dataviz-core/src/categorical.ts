/**
 * Categorical/combo chart data contracts.
 *
 * This is the rendering-agnostic series model that DS chart components can
 * consume or adapt for grouped bars, stacked bars, line/area combos and 100 %
 * stacks.
 */

import { aggregate } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';

export type CategoricalMark = 'bar' | 'line' | 'area';
export type CategoricalAxis = 'left' | 'right';
export type CategoricalMode = 'grouped' | 'stacked' | 'stacked-100';

export type CategoricalMeasureInput =
  | string
  | {
      id: string;
      mark?: CategoricalMark;
      axis?: CategoricalAxis;
    };

export interface CategoricalSeriesConfig {
  category: string;
  series?: string;
  measures: CategoricalMeasureInput[];
  mode?: CategoricalMode;
}

export interface CategoricalMeasure {
  measure: Measure;
  mark: CategoricalMark;
  axis: CategoricalAxis;
}

export interface CategoricalSeries {
  id: string;
  label: string;
  measureId: string;
  seriesKey?: string;
  seriesLabel?: string;
  mark: CategoricalMark;
  axis: CategoricalAxis;
  values: number[];
}

export interface CategoricalSeriesModel {
  categories: string[];
  mode: CategoricalMode;
  series: CategoricalSeries[];
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function resolveMeasures(model: DataModel, inputs: readonly CategoricalMeasureInput[]): CategoricalMeasure[] {
  return inputs.map((input) => {
    const id = typeof input === 'string' ? input : input.id;
    const measure = findMeasure(model, id);
    if (!measure) {
      throw new Error(`Unknown categorical measure: ${id}`);
    }
    return {
      measure,
      mark: typeof input === 'string' ? 'bar' : (input.mark ?? 'bar'),
      axis: typeof input === 'string' ? 'left' : (input.axis ?? 'left'),
    };
  });
}

function uniqueKeys(data: readonly Row[], field: string): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const row of data) {
    const key = cellKey(row[field]);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  return keys;
}

function normalizeStacked100(series: CategoricalSeries[]): void {
  const categoryCount = series[0]?.values.length ?? 0;
  for (let index = 0; index < categoryCount; index += 1) {
    const total = series.reduce((sum, item) => sum + item.values[index]!, 0);
    for (const item of series) {
      item.values[index] = total === 0 ? 0 : item.values[index]! / total;
    }
  }
}

export function buildCategoricalSeries(
  model: DataModel,
  data: readonly Row[],
  config: CategoricalSeriesConfig,
): CategoricalSeriesModel {
  if (!findDimension(model, config.category)) {
    throw new Error(`Unknown categorical category dimension: ${config.category}`);
  }
  if (config.series !== undefined && !findDimension(model, config.series)) {
    throw new Error(`Unknown categorical series dimension: ${config.series}`);
  }

  const measures = resolveMeasures(model, config.measures);
  const categories = uniqueKeys(data, config.category);
  const mode = config.mode ?? 'grouped';
  const output: CategoricalSeries[] = [];

  if (config.series === undefined) {
    for (const item of measures) {
      output.push({
        id: `measure:${item.measure.id}`,
        label: item.measure.label,
        measureId: item.measure.id,
        mark: item.mark,
        axis: item.axis,
        values: categories.map((category) =>
          aggregate(
            [...data].filter((row) => cellKey(row[config.category]) === category),
            item.measure,
          ),
        ),
      });
    }
  } else {
    const seriesKeys = uniqueKeys(data, config.series);
    for (const seriesKey of seriesKeys) {
      for (const item of measures) {
        output.push({
          id: `series:${seriesKey}:${item.measure.id}`,
          label: `${seriesKey} · ${item.measure.label}`,
          measureId: item.measure.id,
          seriesKey,
          seriesLabel: seriesKey,
          mark: item.mark,
          axis: item.axis,
          values: categories.map((category) =>
            aggregate(
              [...data].filter(
                (row) =>
                  cellKey(row[config.category]) === category &&
                  cellKey(row[config.series!]) === seriesKey,
              ),
              item.measure,
            ),
          ),
        });
      }
    }
  }

  if (mode === 'stacked-100') {
    normalizeStacked100(output);
  }

  return { categories, mode, series: output };
}
