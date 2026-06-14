/**
 * Synthetic dataset for the DecompositionTreeChart demo.
 *
 * Chiffre d'affaires décomposé sur 3 niveaux : région → catégorie → produit.
 * 3 régions × 2 catégories × 2 produits = 12 rangées, valeurs variées pour que
 * chaque niveau agrège des totaux distincts. Deterministic, no Math.random.
 */
import { createDashboardStore, type DashboardStore } from '@sentropic/dataviz-svelte';
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const decompositionTreeModel: DataModel = {
  dimensions: [
    { id: 'region',   label: 'Région',    type: 'discrete' },
    { id: 'category', label: 'Catégorie', type: 'discrete' },
    { id: 'product',  label: 'Produit',   type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'CA (k€)', aggregation: 'sum' },
  ],
};

// 3 regions × 2 categories × 2 products = 12 rows.
const REGIONS = ['Nord', 'Sud', 'Est'];
const CATEGORIES = ['Électronique', 'Mobilier'];
const PRODUCTS = ['Premium', 'Standard'];
// Revenue per region/category/product, indexed [region][category][product].
const REVENUE: Record<string, Record<string, Record<string, number>>> = {
  'Nord': {
    'Électronique': { 'Premium': 320, 'Standard': 180 },
    'Mobilier':     { 'Premium': 140, 'Standard': 90  },
  },
  'Sud': {
    'Électronique': { 'Premium': 260, 'Standard': 210 },
    'Mobilier':     { 'Premium': 120, 'Standard': 75  },
  },
  'Est': {
    'Électronique': { 'Premium': 410, 'Standard': 230 },
    'Mobilier':     { 'Premium': 160, 'Standard': 110 },
  },
};

export const decompositionTreeData: Row[] = REGIONS.flatMap((region) =>
  CATEGORIES.flatMap((category) =>
    PRODUCTS.map((product) => ({
      region,
      category,
      product,
      revenue: REVENUE[region]![category]![product]!,
    })),
  ),
);

export function makeDecompositionTreeStore(): DashboardStore {
  return createDashboardStore({ model: decompositionTreeModel, data: decompositionTreeData });
}
