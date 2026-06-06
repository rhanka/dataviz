import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
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

describe('CrossfilteredBarChart (vue)', () => {
  it('exposes the chart with its accessible label', () => {
    const w = mount(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' },
    });
    const img = w.find('[role="img"]');
    expect(img.exists()).toBe(true);
    expect(img.attributes('aria-label')).toBe('Ventes par pays');
  });

  it('aggregates rows into one bar per distinct dimension value', () => {
    const w = mount(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' },
    });
    expect(w.findAll('.st-barChart__bar')).toHaveLength(2);
    expect(w.text()).toContain('FR');
    expect(w.text()).toContain('US');
  });

  it('re-aggregates reactively as the shared filter state narrows the rows', async () => {
    const store = newStore();
    const w = mount(CrossfilteredBarChart, {
      props: { store, viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' },
    });
    expect(w.findAll('.st-barChart__bar')).toHaveLength(2);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await nextTick();
    expect(w.findAll('.st-barChart__bar')).toHaveLength(1);
  });

  it('renders no bars when the measure or dimension is unknown', () => {
    const w1 = mount(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'v', dimension: 'country', measure: 'nope', label: 'Vide' },
    });
    expect(w1.findAll('.st-barChart__bar')).toHaveLength(0);
    const w2 = mount(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'v', dimension: 'nope', measure: 'sales', label: 'Vide' },
    });
    expect(w2.findAll('.st-barChart__bar')).toHaveLength(0);
  });
});
