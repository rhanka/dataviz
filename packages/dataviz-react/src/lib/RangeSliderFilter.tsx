import { useEffect, useState } from 'react';
import { Slider } from '@sentropic/design-system-react';
import { findDimension, type DashboardStore, type FilterSpec, type Row } from '@sentropic/dataviz-core';

export type NumericDomain = { min: number; max: number };

export type RangeSliderFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Continuous numeric dimension to filter. */
  dimension: string;
  label?: string;
  /** Lower bound of the track; defaults to the data minimum. */
  min?: number;
  /** Upper bound of the track; defaults to the data maximum. */
  max?: number;
  step?: number;
};

/**
 * Pure: the numeric `[min, max]` domain of a dimension across rows (finite
 * values only). Returns `{ min: 0, max: 0 }` when no finite value is present.
 */
export function numericDomain(data: readonly Row[], dimension: string): NumericDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const v = row[dimension];
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

/**
 * Pure: two slider handles → a core `range` FilterSpec (bounds normalized so
 * `lo <= hi`), or `null` when they span the whole domain (no constraint).
 */
export function rangeBoundsToSpec(lower: number, upper: number, domain: NumericDomain): FilterSpec | null {
  const lo = Math.min(lower, upper);
  const hi = Math.max(lower, upper);
  if (lo <= domain.min && hi >= domain.max) return null;
  return { kind: 'range', min: lo, max: hi };
}

/**
 * A two-handle numeric range filter composed from two design-system Sliders
 * (min + max) bound to a core `range` filter on a continuous dimension.
 */
export function RangeSliderFilter({ store, dimension, label, min, max, step = 1 }: RangeSliderFilterProps) {
  const [domain] = useState<NumericDomain>(() => {
    const d = numericDomain(store.data, dimension);
    return { min: min ?? d.min, max: max ?? d.max };
  });
  const resolvedLabel = label ?? findDimension(store.model, dimension)?.label ?? dimension;
  const [lower, setLower] = useState(domain.min);
  const [upper, setUpper] = useState(domain.max);

  useEffect(() => {
    const spec = rangeBoundsToSpec(lower, upper, domain);
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  }, [store, dimension, lower, upper, domain]);

  return (
    <>
      <Slider
        label={`${resolvedLabel} (min)`}
        value={lower}
        min={domain.min}
        max={domain.max}
        step={step}
        onChange={(e) => setLower(e.target.valueAsNumber)}
      />
      <Slider
        label={`${resolvedLabel} (max)`}
        value={upper}
        min={domain.min}
        max={domain.max}
        step={step}
        onChange={(e) => setUpper(e.target.valueAsNumber)}
      />
    </>
  );
}
