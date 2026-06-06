import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import CrossfilteredBarChart from './CrossfilteredBarChart.svelte';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', product: 'A', sales: 10 },
  { country: 'FR', product: 'B', sales: 5 },
  { country: 'US', product: 'A', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });

function bars(container: HTMLElement): number {
  return container.querySelectorAll('.st-barChart__bar').length;
}

describe('CrossfilteredBarChart', () => {
  it('exposes the chart with its accessible label', () => {
    const store = newStore();
    render(CrossfilteredBarChart, {
      props: { store, viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' },
    });
    expect(screen.getByRole('img', { name: 'Ventes par pays' })).toBeTruthy();
  });

  it('aggregates rows into one bar per distinct dimension value', () => {
    const store = newStore();
    const { container } = render(CrossfilteredBarChart, {
      props: { store, viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' },
    });
    // FR (10+5=15) and US (20) → two bars.
    expect(bars(container)).toBe(2);
    expect(screen.getByText('FR')).toBeTruthy();
    expect(screen.getByText('US')).toBeTruthy();
  });

  it('re-aggregates reactively as the shared filter state narrows the rows', async () => {
    const store = newStore();
    const { container } = render(CrossfilteredBarChart, {
      props: { store, viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' },
    });
    expect(bars(container)).toBe(2);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await tick();
    expect(bars(container)).toBe(1);
    expect(screen.getByText('FR')).toBeTruthy();
    expect(screen.queryByText('US')).toBeNull();
  });

  it('renders no bars when the measure is unknown', () => {
    const store = newStore();
    const { container } = render(CrossfilteredBarChart, {
      props: { store, viewId: 'byCountry', dimension: 'country', measure: 'nope', label: 'Vide' },
    });
    expect(bars(container)).toBe(0);
  });

  it('renders no bars when the dimension is unknown (no "null" bar)', () => {
    const store = newStore();
    const { container } = render(CrossfilteredBarChart, {
      props: { store, viewId: 'byCountry', dimension: 'nope', measure: 'sales', label: 'Vide' },
    });
    expect(bars(container)).toBe(0);
  });
});
