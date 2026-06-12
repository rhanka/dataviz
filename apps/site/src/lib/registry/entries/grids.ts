import type { Component } from 'svelte';
import type { DemoEntry } from '../types';
import { storeCode } from './code';

type Demo = Component<{ kind?: string; controls?: boolean }>;

function grid(
  e: Omit<DemoEntry, 'section' | 'demo' | 'group'> & { kind: string },
  Comp: Demo,
): DemoEntry {
  const { kind, ...rest } = e;
  return { ...rest, group: 'Tables & pivots', section: 'grids', demo: Comp, demoProps: { kind } };
}

export function GRID_ENTRIES(GridDemo: Demo): DemoEntry[] {
  return [
    grid({
      slug: 'conditional-format', name: 'Conditional Formatting', kind: 'conditional-format', hasControls: false,
      tagline: 'Mise en forme conditionnelle : règles seuil → décoration DS.',
      useCase:
        "FR-6 : le moteur de règles `dataviz-core` (`rule('gt', X, 'positive')`) produit des décorations sémantiques (`ConditionalDecoration`) qui sont transmises au `DataTable` du design system via la prop `decorations`. Ici, le revenu est coloré vert au-delà de 50 000 €, rouge sous 10 000 €, et le taux de marge déclenche un avertissement sous 25 %.",
      code: storeCode(['RecordsTable'], {
        svelte: `<script lang="ts">
  import { rule } from '@sentropic/dataviz-core';
  const revenueFormat = [
    rule('gt', 50000, 'positive', { icon: 'trending-up' }),
    rule('lt', 10000, 'negative', { icon: 'trending-down' }),
  ];
  const marginRateFormat = [
    rule('gte', 0.40, 'positive'),
    rule('lt', 0.25, 'warning'),
  ];
</script>
<RecordsTable
  {store}
  fields={['region', 'category', 'channel', 'revenue', 'margin', 'marginRate']}
  conditionalFormat={{ revenue: revenueFormat, marginRate: marginRateFormat }}
  pageSize={15}
  caption="Mise en forme conditionnelle" />`,
        react: `const revenueFormat = [
  rule('gt', 50000, 'positive', { icon: 'trending-up' }),
  rule('lt', 10000, 'negative', { icon: 'trending-down' }),
];
const marginRateFormat = [
  rule('gte', 0.40, 'positive'),
  rule('lt', 0.25, 'warning'),
];
<RecordsTable
  store={store}
  fields={['region', 'category', 'channel', 'revenue', 'margin', 'marginRate']}
  conditionalFormat={{ revenue: revenueFormat, marginRate: marginRateFormat }}
  pageSize={15}
  caption="Mise en forme conditionnelle" />`,
        vue: `<RecordsTable
  :store="store"
  :fields="['region', 'category', 'channel', 'revenue', 'margin', 'marginRate']"
  :conditionalFormat="{ revenue: revenueFormat, marginRate: marginRateFormat }"
  :pageSize="15"
  caption="Mise en forme conditionnelle" />`,
      }),
    }, GridDemo),
    grid({
      slug: 'records-table', name: 'RecordsTable', kind: 'records', hasControls: false,
      tagline: 'Table des enregistrements cross-filtrés, paginée.',
      useCase:
        "Le « show records » du BI : la table détaillée des lignes visibles après cross-filter, paginée et triable, bâtie sur le DataTable du design system. Choisissez les colonnes via `fields`.",
      code: storeCode(['RecordsTable'], {
        svelte: `<RecordsTable {store} pageSize={12} caption="Commandes (cross-filtrées)" />`,
        react: `<RecordsTable store={store} pageSize={12} caption="Commandes (cross-filtrées)" />`,
        vue: `<RecordsTable :store="store" :pageSize="12" caption="Commandes (cross-filtrées)" />`,
      }),
    }, GridDemo),
    grid({
      slug: 'pivot-table', name: 'PivotDataTable', kind: 'pivot', hasControls: false,
      tagline: 'Tableau croisé agrégé (lignes × colonnes × mesure).',
      useCase:
        "Le tableau croisé classique : des dimensions en lignes et en colonnes, une ou plusieurs mesures agrégées dans les cellules. Réutilise le DataTable du design system.",
      code: storeCode(['PivotDataTable'], {
        svelte: `<PivotDataTable {store}
  rows={['region', 'country']}
  columns={['channel']}
  measures={['revenue']}
  caption="Revenu par région/pays × canal" />`,
        react: `<PivotDataTable store={store}
  rows={['region', 'country']}
  columns={['channel']}
  measures={['revenue']}
  caption="Revenu par région/pays × canal" />`,
        vue: `<PivotDataTable :store="store"
  :rows="['region', 'country']"
  :columns="['channel']"
  :measures="['revenue']"
  caption="Revenu par région/pays × canal" />`,
      }),
    }, GridDemo),
    grid({
      slug: 'advanced-pivot', name: 'AdvancedPivotDataTable', kind: 'advancedpivot', hasControls: true,
      tagline: 'Pivot avancé : sous-totaux, expand/collapse, heat, sparkline.',
      useCase:
        "Le pivot « pro » : sous-totaux par niveau, lignes repliables, coloration de cellule (heat) selon une mesure et sparkline en cellule sur une dimension temporelle. Cliquez les flèches pour replier/déplier.",
      code: storeCode(['AdvancedPivotDataTable'], {
        svelte: `<AdvancedPivotDataTable {store}
  rows={['region', 'category']}
  columns={['channel']}
  measures={['revenue', 'units']}
  includeSubtotals
  heatmap
  sparklineDimension="month"
  caption="Pivot avancé" />`,
        react: `<AdvancedPivotDataTable store={store}
  rows={['region', 'category']}
  columns={['channel']}
  measures={['revenue', 'units']}
  includeSubtotals
  heatmap
  sparklineDimension="month"
  caption="Pivot avancé" />`,
        vue: `<AdvancedPivotDataTable :store="store"
  :rows="['region', 'category']"
  :columns="['channel']"
  :measures="['revenue', 'units']"
  includeSubtotals
  heatmap
  sparklineDimension="month"
  caption="Pivot avancé" />`,
      }),
    }, GridDemo),
  ];
}
