import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { CrossfilteredBarChart } from './CrossfilteredBarChart.js';

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
const bars = (c: HTMLElement) => c.querySelectorAll('.st-barChart__bar').length;

describe('CrossfilteredBarChart (react)', () => {
  it('exposes the chart with its accessible label', () => {
    render(
      <CrossfilteredBarChart
        store={newStore()}
        viewId="byCountry"
        dimension="country"
        measure="sales"
        label="Ventes par pays"
      />,
    );
    expect(screen.getByRole('img', { name: 'Ventes par pays' })).toBeTruthy();
  });

  it('aggregates rows into one bar per distinct dimension value', () => {
    const { container } = render(
      <CrossfilteredBarChart
        store={newStore()}
        viewId="byCountry"
        dimension="country"
        measure="sales"
        label="Ventes par pays"
      />,
    );
    expect(bars(container)).toBe(2);
    expect(screen.getByText('FR')).toBeTruthy();
    expect(screen.getByText('US')).toBeTruthy();
  });

  it('re-aggregates reactively as the shared filter state narrows the rows', () => {
    const store = newStore();
    const { container } = render(
      <CrossfilteredBarChart
        store={store}
        viewId="byCountry"
        dimension="country"
        measure="sales"
        label="Ventes par pays"
      />,
    );
    expect(bars(container)).toBe(2);
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });
    expect(bars(container)).toBe(1);
    expect(screen.queryByText('US')).toBeNull();
  });

  it('renders no bars when the measure or dimension is unknown', () => {
    const { container: c1 } = render(
      <CrossfilteredBarChart
        store={newStore()}
        viewId="byCountry"
        dimension="country"
        measure="nope"
        label="Vide"
      />,
    );
    expect(bars(c1)).toBe(0);
    const { container: c2 } = render(
      <CrossfilteredBarChart
        store={newStore()}
        viewId="byCountry"
        dimension="nope"
        measure="sales"
        label="Vide"
      />,
    );
    expect(bars(c2)).toBe(0);
  });
});
