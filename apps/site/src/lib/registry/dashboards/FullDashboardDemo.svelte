<!--
  Tableau de bord complet — usecase flagship du catalogue dataviz.

  Un seul createDashboardStore relie quatre panneaux KPI, un graphique en aires
  tendance mensuelle, un bar chart cross-filtré par catégorie, un donut
  part-of-whole par canal, et une table d'enregistrements filtrés. Cliquer une
  barre ou un segment cross-filtre instantanément tous les autres panneaux.

  CSS layout-only (tokens DS) : miroir de la grille du DS dashboard view.
  Aucun markup de chart ni de table n'est écrit à la main.
-->
<script lang="ts">
  import {
    DashboardActiveFilters,
    DashboardGrid,
    SelectionLegend,
    KpiCardGroup,
    CrossfilteredBarChart,
    AreaChart,
    DonutChart,
    RecordsTable,
  } from '@sentropic/dataviz-svelte';
  import { addPanel, createLayout, type DashboardLayout } from '@sentropic/dataviz-core';
  import { makeStore } from '../../data/store';

  const store = makeStore();

  /* KpiCardFormat accepted values: "number" | "currency" | "percent" */
  const kpiConfigs = [
    { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
    { id: 'units',   measure: 'units',   label: 'Unités vendues' },
    { id: 'margin',  measure: 'margin',  label: 'Marge brute (€)' },
  ];

  const initialLayout = addPanel(
    addPanel(
      addPanel(
        addPanel(
          addPanel(createLayout(12), { id: 'kpis', x: 0, y: 0, w: 12, h: 2 }),
          { id: 'trend', x: 0, y: 2, w: 6, h: 3 },
        ),
        { id: 'byCat', x: 6, y: 2, w: 3, h: 3 },
      ),
      { id: 'byChan', x: 9, y: 2, w: 3, h: 3 },
    ),
    { id: 'table', x: 0, y: 5, w: 12, h: 3 },
  );

  const dashboardPanels = [
    { id: 'kpis', title: 'Indicateurs' },
    { id: 'trend', title: 'Tendance mensuelle' },
    { id: 'byCat', title: 'Catégories' },
    { id: 'byChan', title: 'Canaux' },
    { id: 'table', title: 'Enregistrements' },
  ];

  let layout = $state<DashboardLayout>(initialLayout);
  let editMode = $state(false);
</script>

<div class="full-dash">
  <!-- Barre de filtres actifs + légende des sélections -->
  <DashboardActiveFilters {store} />
  <SelectionLegend {store} labels={{ byCat: 'Catégorie', byChan: 'Canal' }} />

  <div class="full-dash__toolbar">
    <button
      type="button"
      class:active={editMode}
      aria-pressed={editMode}
      onclick={() => (editMode = !editMode)}
    >
      Édition
    </button>
  </div>

  <DashboardGrid
    {layout}
    panels={dashboardPanels}
    editable={editMode}
    rowHeight={96}
    onLayoutChange={(next) => (layout = next)}
  >
    {#snippet children(meta)}
      {#if meta.id === 'kpis'}
        <KpiCardGroup {store} configs={kpiConfigs} />
      {:else if meta.id === 'trend'}
        <AreaChart
          {store}
          viewId="trend"
          category="month"
          measure="revenue"
          label="Tendance mensuelle du revenu"
          smooth={true}
        />
      {:else if meta.id === 'byCat'}
        <CrossfilteredBarChart
          {store}
          viewId="byCat"
          dimension="category"
          measure="revenue"
          label="Revenu par catégorie"
        />
      {:else if meta.id === 'byChan'}
        <DonutChart
          {store}
          viewId="byChan"
          category="channel"
          measure="revenue"
          centerLabel="Canal"
          label="Répartition par canal"
        />
      {:else if meta.id === 'table'}
        <RecordsTable
          {store}
          pageSize={8}
          fields={['region', 'category', 'product', 'channel', 'revenue', 'units', 'margin']}
        />
      {/if}
    {/snippet}
  </DashboardGrid>
</div>

<style>
  .full-dash {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  .full-dash__toolbar {
    display: flex;
    justify-content: flex-end;
  }

  .full-dash__toolbar button {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #d8dee8);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text, #0f172a);
    cursor: pointer;
    font: inherit;
    min-height: 2rem;
    padding: 0 var(--st-spacing-3, 0.75rem);
  }

  .full-dash__toolbar button.active {
    background: var(--st-semantic-accent-subtle, #dbeafe);
    border-color: var(--st-semantic-accent, #2563eb);
  }
</style>
