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
    DashboardFilterBar,
    SelectionLegend,
    KpiCardGroup,
    CrossfilteredBarChart,
    AreaChart,
    DonutChart,
    RecordsTable,
  } from '@sentropic/dataviz-svelte';
  import { makeStore } from '../../data/store';

  const store = makeStore();

  /* KpiCardFormat accepted values: "number" | "currency" | "percent" */
  const kpiConfigs = [
    { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
    { id: 'units',   measure: 'units',   label: 'Unités vendues' },
    { id: 'margin',  measure: 'margin',  label: 'Marge brute (€)' },
  ];
</script>

<div class="full-dash">
  <!-- Barre de filtres actifs + légende des sélections -->
  <DashboardFilterBar {store} />
  <SelectionLegend {store} labels={{ byCat: 'Catégorie', byChan: 'Canal' }} />

  <!-- Rangée KPI -->
  <div class="dash-kpi-row">
    <KpiCardGroup {store} configs={kpiConfigs} />
  </div>

  <!-- Rangée graphiques : tendance | barres catégorie | donut canal -->
  <div class="dash-charts-row">
    <div class="dash-chart dash-chart--main">
      <AreaChart
        {store}
        viewId="trend"
        category="month"
        measure="revenue"
        label="Tendance mensuelle du revenu"
        smooth={true}
      />
    </div>
    <div class="dash-chart dash-chart--side">
      <CrossfilteredBarChart
        {store}
        viewId="byCat"
        dimension="category"
        measure="revenue"
        label="Revenu par catégorie"
      />
    </div>
    <div class="dash-chart dash-chart--side">
      <DonutChart
        {store}
        viewId="byChan"
        category="channel"
        measure="revenue"
        centerLabel="Canal"
        label="Répartition par canal"
      />
    </div>
  </div>

  <!-- Table d'enregistrements cross-filtrés -->
  <div class="dash-table">
    <RecordsTable
      {store}
      pageSize={8}
      fields={['region', 'category', 'product', 'channel', 'revenue', 'units', 'margin']}
    />
  </div>
</div>

<style>
  .full-dash {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  /* KPI row — auto-fill, min 180 px par carte */
  .dash-kpi-row {
    width: 100%;
  }

  /* Rangée graphiques : tendance principale large (2fr) + deux panneaux latéraux (1fr chacun) */
  .dash-charts-row {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    grid-template-columns: 2fr 1fr 1fr;
    width: 100%;
  }

  .dash-chart {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
    padding: var(--st-spacing-4, 1rem);
  }

  /* Table pleine largeur */
  .dash-table {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
    padding: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  /* Responsive : sous 860 px, graphiques en colonne */
  @media (max-width: 860px) {
    .dash-charts-row {
      grid-template-columns: 1fr;
    }
  }
</style>
