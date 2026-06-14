/**
 * Synthetic dataset for the RibbonChart demo.
 *
 * Parts de marché par produit et par trimestre : 4 produits × 5 trimestres.
 * Chaque produit a une trajectoire distincte (montée, descente, plateau),
 * ce qui met en valeur les changements de classement caractéristiques du
 * Ribbon chart. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const ribbonModel: DataModel = {
  dimensions: [
    { id: 'product', label: 'Produit',    type: 'discrete' },
    { id: 'quarter', label: 'Trimestre',  type: 'discrete' },
  ],
  measures: [
    { id: 'sales', label: 'Ventes (k€)', aggregation: 'sum' },
  ],
};

// 4 products × 5 quarters — values chosen so ranks swap between periods
const QUARTERS = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'];
const PRODUCTS: Record<string, number[]> = {
  'Alpha':  [320, 280, 350, 410, 390],
  'Beta':   [210, 340, 300, 260, 430],
  'Gamma':  [180, 190, 370, 320, 280],
  'Delta':  [140, 220, 195, 350, 310],
};

export const ribbonData: Row[] = QUARTERS.flatMap((quarter) =>
  Object.entries(PRODUCTS).map(([product, values]) => ({
    product,
    quarter,
    sales: values[QUARTERS.indexOf(quarter)]!,
  })),
);

export function makeRibbonStore(): DashboardStore {
  return createDashboardStore({ model: ribbonModel, data: ribbonData });
}
