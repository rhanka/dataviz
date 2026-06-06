import type { CrossfilterGraph, DataModel, Row } from '@sentropic/dataviz-react';

export const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
    { id: 'month', label: 'Mois', type: 'discrete' },
    { id: 'date', label: 'Date', type: 'continuous' },
    { id: 'price', label: 'Prix unitaire (€)', type: 'continuous' },
  ],
  measures: [
    { id: 'sales', label: 'Ventes (€)', aggregation: 'sum' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
  ],
};

const countries: Record<string, string[]> = {
  France: ['Paris', 'Lyon'],
  USA: ['New York', 'Austin'],
  Allemagne: ['Berlin'],
};
const products = ['Alpha', 'Beta', 'Gamma'];
const months = ['Jan', 'Fév', 'Mar'];

/** Fixed reference "now" for the relative-date demo (keeps the build deterministic). */
export const DEMO_NOW = new Date('2024-04-01T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

export const data: Row[] = (() => {
  const rows: Row[] = [];
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (const [country, cities] of Object.entries(countries)) {
    for (const city of cities) {
      for (const product of products) {
        for (const month of months) {
          rows.push({
            country,
            city,
            product,
            month,
            // Spread across the ~120 days before DEMO_NOW so relative-date presets bite.
            date: DEMO_NOW.getTime() - Math.floor(next() * 120) * DAY_MS,
            price: Math.round(5 + next() * 45),
            sales: Math.round(50 + next() * 950),
            units: Math.round(1 + next() * 99),
          });
        }
      }
    }
  }
  return rows;
})();

export const crossfilter: CrossfilterGraph = {
  views: {
    byCountry: { field: 'country' },
    byProduct: { field: 'product' },
  },
};
