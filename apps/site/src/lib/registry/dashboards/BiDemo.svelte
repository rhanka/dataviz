<!--
  Dashboard / BI component demos. Each `kind` mounts a real dataviz state
  consumer against a shared seeded store, so cross-filter / drill / Top-N / KPI
  all operate on the same ~700-row dataset. Selecting in one view narrows the
  records table and KPIs live.
-->
<script lang="ts">
  import {
    DashboardActiveFilters,
    SelectionLegend,
    CrossfilteredBarChart,
    SmallMultiples,
    DrillBarChart,
    DrillBreadcrumb,
    RecordsTable,
    TopNFilter,
    ValueSlicer,
    RelativeDateFilter,
    RangeSliderFilter,
    DateRangeFilter,
    ExportMenu,
    KpiCardGroup,
    FieldPane,
    BookmarkNavigator,
    FormatPanel,
    CalculationEditor,
    WebFrame,
    DataImage,
    ObjectLayerPanel,
    type FormatPanelState,
    type CalculatedFieldConfig,
  } from '@sentropic/dataviz-svelte';
  import { makeStore } from '../../data/store';
  import { model, DEMO_NOW } from '../../data/dataset';

  let { kind }: { kind: string; controls?: boolean } = $props();
  const store = makeStore();

  const kpiConfigs = [
    { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
    { id: 'units', measure: 'units', label: 'Unités vendues' },
    { id: 'margin', measure: 'margin', label: 'Marge brute' },
  ];

  const bookmarks = [
    { id: 'all', label: 'Tout', filters: {} },
    { id: 'europe', label: 'Europe', filters: { region: { kind: 'set', values: ['Europe'] } } },
    { id: 'apac', label: 'Asie-Pacifique', filters: { region: { kind: 'set', values: ['Asie-Pacifique'] } } },
  ] as never;

  let format = $state<FormatPanelState>({
    axis: { min: null, max: null, log: false, inverted: false },
    legend: { title: 'Revenu', visible: true },
    marker: { shape: 'circle', size: 6, color: '#4E79A7' },
  } as FormatPanelState);

  let calc = $state<CalculatedFieldConfig>({
    id: 'revenuePerUnit',
    label: 'Revenu / unité',
    expression: '[revenue] / [units]',
  } as CalculatedFieldConfig);

  const layers = [
    { id: 'kpis', label: 'Bandeau KPI', visible: true, children: [
      { id: 'kpi-rev', label: 'Revenu', visible: true },
      { id: 'kpi-units', label: 'Unités', visible: true },
    ] },
    { id: 'charts', label: 'Graphiques', visible: true, children: [
      { id: 'map', label: 'Carte des ventes', visible: true },
      { id: 'trend', label: 'Tendance', visible: false },
    ] },
  ] as never;
</script>

<div class="stage">
  {#if kind === 'crossfilter'}
    <DashboardActiveFilters {store} />
    <SelectionLegend {store} labels={{ byCat: 'Catégorie', byChannel: 'Canal' }} />
    <div class="grid2">
      <CrossfilteredBarChart {store} viewId="byCat" dimension="category" measure="revenue" label="Revenu par catégorie" />
      <CrossfilteredBarChart {store} viewId="byChannel" dimension="channel" measure="revenue" label="Revenu par canal" tone="category2" />
    </div>
    <RecordsTable {store} pageSize={6} fields={['region', 'category', 'channel', 'revenue', 'units']} />
  {:else if kind === 'filterbar'}
    <DashboardActiveFilters {store} />
    <ValueSlicer {store} dimension="region" orientation="horizontal" />
    <RecordsTable {store} pageSize={6} />
  {:else if kind === 'selectionlegend'}
    <SelectionLegend {store} labels={{ a: 'Région', b: 'Canal' }} />
    <div class="grid2">
      <CrossfilteredBarChart {store} viewId="a" dimension="region" measure="revenue" label="Région" />
      <CrossfilteredBarChart {store} viewId="b" dimension="channel" measure="revenue" label="Canal" tone="category3" />
    </div>
  {:else if kind === 'crossbar'}
    <CrossfilteredBarChart {store} viewId="cb" dimension="country" measure="revenue" label="Revenu par pays" />
    <RecordsTable {store} viewId="cb" pageSize={5} fields={['country', 'city', 'revenue']} />
  {:else if kind === 'smallmultiples'}
    <SmallMultiples {store} viewId="sm" facetBy="region" dimension="category" measure="revenue" label="Revenu" columns={3} />
  {:else if kind === 'drill'}
    <DrillBreadcrumb {store} viewId="drill" hierarchy={['region', 'country', 'city']} />
    <DrillBarChart {store} viewId="drill" hierarchy={['region', 'country', 'city']} measure="revenue" label="Drill géographique" tone="category4" />
  {:else if kind === 'records'}
    <RecordsTable {store} pageSize={10} />
  {:else if kind === 'kpi'}
    <KpiCardGroup {store} configs={kpiConfigs} />
  {:else if kind === 'topn'}
    <TopNFilter {store} dimension="product" measure="revenue" defaultN={4} label="Top N produits" />
    <CrossfilteredBarChart {store} viewId="topn" dimension="product" measure="revenue" label="Produits" selectable={false} orientation="horizontal" />
  {:else if kind === 'valueslicer'}
    <ValueSlicer {store} dimension="category" />
    <RecordsTable {store} pageSize={6} fields={['category', 'product', 'revenue']} />
  {:else if kind === 'relativedate'}
    <RelativeDateFilter {store} dimension="date" now={DEMO_NOW} label="Période" />
    <RecordsTable {store} pageSize={6} fields={['month', 'category', 'revenue']} />
  {:else if kind === 'rangeslider'}
    <RangeSliderFilter {store} dimension="price" step={1} label="Prix unitaire (€)" />
    <RecordsTable {store} pageSize={6} fields={['product', 'price', 'units', 'revenue']} />
  {:else if kind === 'daterange'}
    <DateRangeFilter {store} dimension="date" label="Plage de dates" />
    <RecordsTable {store} pageSize={6} fields={['month', 'category', 'revenue']} />
  {:else if kind === 'export'}
    <ExportMenu {store} filename="ventes.csv" label="Exporter en CSV" />
    <RecordsTable {store} pageSize={6} />
  {:else if kind === 'fieldpane'}
    <FieldPane {model} label="Champs du modèle" />
  {:else if kind === 'bookmarks'}
    <BookmarkNavigator {store} bookmarks={bookmarks} showPlaybackControls />
    <RecordsTable {store} pageSize={6} fields={['region', 'category', 'revenue']} />
  {:else if kind === 'formatpanel'}
    <FormatPanel value={format} onChange={(v) => (format = v)} label="Format & axes" />
  {:else if kind === 'calculation'}
    <CalculationEditor {model} value={calc} onChange={(v) => (calc = v)} label="Champ calculé" />
  {:else if kind === 'webframe'}
    <WebFrame frame={{ url: 'https://www.openstreetmap.org/export/embed.html?bbox=2.2,48.8,2.4,48.9&layer=mapnik', title: 'Carte intégrée', sandbox: ['allow-scripts', 'allow-same-origin'], height: 320 } as never} />
  {:else if kind === 'dataimage'}
    <DataImage image={{ srcTemplate: 'https://placehold.co/160x100?text={category}', altTemplate: 'Visuel — {category}', fallbackSrc: 'https://placehold.co/160x100?text=N%2FA' } as never} row={{ category: 'Capteurs' } as never} />
  {:else if kind === 'objectpanel'}
    <ObjectLayerPanel layers={layers} defaultExpandedIds={['kpis', 'charts']} label="Calques du tableau de bord" />
  {/if}
</div>

<style>
  .stage { display: flex; flex-direction: column; gap: var(--st-spacing-4, 1rem); }
  .grid2 {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
</style>
