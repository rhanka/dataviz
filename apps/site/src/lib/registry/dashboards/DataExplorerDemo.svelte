<!--
  Explorateur de données — usecase BI exploration libre-service.

  Un seul createDashboardStore sur le dataset de démonstration (~700 lignes).
  L'utilisateur choisit une dimension et une mesure via des ContentSwitcher DS ;
  la sélection change dynamiquement le CrossfilteredBarChart et la RecordsTable,
  dont les filtres sont pilotés par un TopNFilter + un ValueSlicer. Cliquer une
  barre cross-filtre instantanément la table et les slicers.

  DashboardFilterBar + SelectionLegend résument les filtres actifs.
  CSS layout-only, tokens DS uniquement — aucun markup de chart/table à la main.
-->
<script lang="ts">
  import {
    DashboardFilterBar,
    SelectionLegend,
    CrossfilteredBarChart,
    RecordsTable,
    TopNFilter,
    ValueSlicer,
  } from '@sentropic/dataviz-svelte';
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  import { makeStore } from '../../data/store';

  const store = makeStore();

  /* ── Dimension picker ─────────────────────────────────────────────────── */
  type DimId = 'category' | 'region' | 'channel' | 'segment';
  let dimension = $state<DimId>('category');

  const dimItems: { value: DimId; label: string }[] = [
    { value: 'category', label: 'Catégorie' },
    { value: 'region',   label: 'Région' },
    { value: 'channel',  label: 'Canal' },
    { value: 'segment',  label: 'Segment' },
  ];

  /* ── Measure picker ───────────────────────────────────────────────────── */
  type MeasureId = 'revenue' | 'units' | 'margin';
  let measure = $state<MeasureId>('revenue');

  const measureItems: { value: MeasureId; label: string }[] = [
    { value: 'revenue', label: 'Revenu (€)' },
    { value: 'units',   label: 'Unités' },
    { value: 'margin',  label: 'Marge (€)' },
  ];

  /* ── Derived labels for legends / table ──────────────────────────────── */
  const dimLabel    = $derived(dimItems.find((d) => d.value === dimension)?.label ?? dimension);
  const measureLabel = $derived(measureItems.find((m) => m.value === measure)?.label ?? measure);
</script>

<div class="explorer">
  <!-- Barre de filtres actifs + légende des sélections -->
  <DashboardFilterBar {store} />
  <SelectionLegend {store} labels={{ main: dimLabel }} />

  <!-- Sélecteurs de dimension et de mesure -->
  <div class="explorer-controls">
    <ContentSwitcher
      size="sm"
      label="Dimension"
      items={dimItems}
      value={dimension}
      onchange={(v) => (dimension = v as DimId)}
    />
    <ContentSwitcher
      size="sm"
      label="Mesure"
      items={measureItems}
      value={measure}
      onchange={(v) => (measure = v as MeasureId)}
    />
  </div>

  <!-- Zone principale : chart + slicers -->
  <div class="explorer-main">
    <!-- Colonne gauche : graphique cross-filtré -->
    <div class="explorer-chart-panel">
      <CrossfilteredBarChart
        {store}
        viewId="main"
        {dimension}
        {measure}
        label="{measureLabel} par {dimLabel}"
      />
    </div>

    <!-- Colonne droite : slicers -->
    <div class="explorer-slicers">
      <div class="slicer-card">
        <p class="slicer-title">Top N produits</p>
        <TopNFilter
          {store}
          dimension="product"
          measure={measure}
          defaultN={5}
          label="Top N produits"
        />
      </div>
      <div class="slicer-card">
        <p class="slicer-title">Filtre canal</p>
        <ValueSlicer {store} dimension="channel" />
      </div>
    </div>
  </div>

  <!-- Table d'enregistrements cross-filtrés -->
  <div class="explorer-table">
    <RecordsTable
      {store}
      pageSize={8}
      fields={[dimension, 'product', 'channel', 'region', 'revenue', 'units', 'margin']}
    />
  </div>
</div>

<style>
  .explorer {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  /* Sélecteurs inline */
  .explorer-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--st-spacing-4, 1rem);
  }

  /* Zone principale : chart large + slicers latéraux */
  .explorer-main {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: var(--st-spacing-4, 1rem);
    align-items: start;
  }

  .explorer-chart-panel {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
    padding: var(--st-spacing-4, 1rem);
  }

  /* Colonne des slicers */
  .explorer-slicers {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .slicer-card {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    padding: var(--st-spacing-4, 1rem);
  }

  .slicer-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
    margin: 0 0 var(--st-spacing-3, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Table pleine largeur */
  .explorer-table {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
    padding: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  /* Responsive : sous 700 px, slicers sous le chart */
  @media (max-width: 700px) {
    .explorer-main {
      grid-template-columns: 1fr;
    }
  }
</style>
