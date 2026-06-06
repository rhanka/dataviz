import type { CrossfilterGraph, DataModel, Row } from '@sentropic/dataviz-react';

export const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
    { id: 'month', label: 'Mois', type: 'discrete' },
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
