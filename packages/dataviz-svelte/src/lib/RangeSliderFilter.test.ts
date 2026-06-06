import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import RangeSliderFilter, { numericDomain, rangeBoundsToSpec } from './RangeSliderFilter.svelte';

describe('numericDomain', () => {
  it('computes [min,max] over finite numeric cells', () => {
    expect(numericDomain([{ x: 3 }, { x: 1 }, { x: 8 }] as Row[], 'x')).toEqual({ min: 1, max: 8 });
  });
  it('ignores non-numeric / non-finite cells', () => {
    expect(numericDomain([{ x: 'a' }, { x: NaN }, { x: 5 }] as Row[], 'x')).toEqual({ min: 5, max: 5 });
  });
  it('falls back to {0,0} with no finite values', () => {
    expect(numericDomain([] as Row[], 'x')).toEqual({ min: 0, max: 0 });
  });
});

describe('rangeBoundsToSpec', () => {
  const domain = { min: 0, max: 10 };
  it('returns null when handles span the whole domain', () => {
    expect(rangeBoundsToSpec(0, 10, domain)).toBeNull();
  });
  it('maps a narrowed window to a range spec', () => {
    expect(rangeBoundsToSpec(2, 8, domain)).toEqual({ kind: 'range', min: 2, max: 8 });
  });
  it('normalizes reversed handles', () => {
    expect(rangeBoundsToSpec(8, 2, domain)).toEqual({ kind: 'range', min: 2, max: 8 });
  });
});

const model: DataModel = {
  dimensions: [{ id: 'x', label: 'Montant', type: 'continuous' }],
  measures: [{ id: 'v', label: 'V', aggregation: 'sum' }],
};

describe('RangeSliderFilter', () => {
  it('renders two labelled sliders and does not filter at the full domain', async () => {
    const store = createDashboardStore({ model, data: [{ x: 0, v: 1 }, { x: 10, v: 1 }] as Row[] });
    const { container } = render(RangeSliderFilter, { props: { store, dimension: 'x' } });
    await tick();
    expect(container.textContent).toContain('Montant (min)');
    expect(container.textContent).toContain('Montant (max)');
    expect(store.getState().filters.x).toBeUndefined();
  });
});
