<!--
  One multiplexed chart demo. `kind` selects which dataviz chart wrapper to
  render; all share a single seeded store and react to a measure + a "Top-N
  categories" control so the demos feel like real, explorable visuals (not toy
  3-row charts). Colour comes entirely from the active DS palette (tone tokens).
-->
<script lang="ts">
  import {
    AreaChart,
    ComboChart,
    StackedBarChart,
    LollipopChart,
    StepLineChart,
    ParetoChart,
    DivergingBarChart,
    DonutChart,
    FunnelChart,
    WaterfallChart,
    TreemapChart,
    SunburstChart,
    SankeyChart,
    RadarChart,
    MekkoChart,
    ChordChart,
    RoseChart,
    PackedBubbleChart,
    HistogramChart,
    BoxPlotChart,
    HeatmapChart,
    CalendarHeatmapChart,
    BulletChart,
    GaugeChart,
    ReferenceLineChart,
    PercentileBandChart,
    TrendLineChart,
    ForecastLineChart,
    ErrorBarsChart,
    AnalyticsClusterPlot,
    ScatterPlot,
    CandlestickChart,
    Sparkline,
    ScoreCard,
  } from '@sentropic/dataviz-svelte';
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  import { lineAnnotation, regionAnnotation, makeFormatter } from '@sentropic/dataviz-core';
  import { makeStore } from '../../data/store';
  import { makeOhlcStore } from '../../data/ohlc-store';

  let { kind, controls = true }: { kind: string; controls?: boolean } = $props();

  const store = makeStore();
  const ohlcStore = makeOhlcStore();

  let measure = $state<'revenue' | 'units' | 'margin'>('revenue');
  const measureItems = [
    { value: 'revenue', label: 'Revenu (€)' },
    { value: 'units', label: 'Unités' },
    { value: 'margin', label: 'Marge (€)' },
  ];

  // A category dimension control for the "by X" charts.
  let dimension = $state<'category' | 'country' | 'channel' | 'segment'>('category');
  const dimItems = [
    { value: 'category', label: 'Catégorie' },
    { value: 'country', label: 'Pays' },
    { value: 'channel', label: 'Canal' },
    { value: 'segment', label: 'Segment' },
  ];

  const showDim = $derived(
    [
      'area', 'lollipop', 'step', 'pareto', 'diverging', 'donut', 'funnel',
      'waterfall', 'rose', 'packed', 'stacked', 'mekko',
    ].includes(kind),
  );
  const showMeasure = $derived(kind !== 'gauge' && kind !== 'box' && kind !== 'histogram');

  // ── AreaChart: annotations + data-labels ──────────────────────────────────
  const areaAnnotations = [
    lineAnnotation('y', 400000, { label: 'Objectif' }),
    regionAnnotation('y', 350000, 500000, { label: 'Zone cible' }),
  ];
  const areaDataLabels = { format: makeFormatter({ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }) };

  // ── StackedBarChart: legend toggle ────────────────────────────────────────
  let hiddenSeries = $state<string[]>([]);
  function onToggleSeries(seriesId: string) {
    hiddenSeries = hiddenSeries.includes(seriesId)
      ? hiddenSeries.filter((id) => id !== seriesId)
      : [...hiddenSeries, seriesId];
  }
</script>

{#if controls}
  <div class="ctrls">
    {#if showMeasure}
      <div class="ctrl">
        <span>Mesure</span>
        <ContentSwitcher size="sm" label="Mesure" items={measureItems} value={measure} onchange={(v) => (measure = v as typeof measure)} />
      </div>
    {/if}
    {#if showDim}
      <div class="ctrl">
        <span>Dimension</span>
        <ContentSwitcher size="sm" label="Dimension" items={dimItems} value={dimension} onchange={(v) => (dimension = v as typeof dimension)} />
      </div>
    {/if}
  </div>
{/if}

<div class="stage">
  {#if kind === 'area'}
    <AreaChart {store} viewId="c" category={dimension} {measure} label="Revenu par {dimension}" smooth
      annotations={areaAnnotations} dataLabels={areaDataLabels} />
  {:else if kind === 'combo'}
    <ComboChart {store} viewId="c" category="category"
      measures={[{ measure: 'revenue', mode: 'bar', label: 'Revenu' }, { measure: 'units', mode: 'line', label: 'Unités' }]}
      leftAxisLabel="Revenu (€)" rightAxisLabel="Unités" label="Revenu & unités par catégorie" legend />
  {:else if kind === 'stacked'}
    <StackedBarChart {store} viewId="c" category={dimension} series="channel" {measure} mode="stacked" label="Par {dimension} et canal"
      {hiddenSeries} {onToggleSeries} />
  {:else if kind === 'lollipop'}
    <LollipopChart {store} viewId="c" category={dimension} {measure} label="Lollipop" orientation="horizontal" />
  {:else if kind === 'step'}
    <StepLineChart {store} viewId="c" category="month" {measure} label="Évolution mensuelle" />
  {:else if kind === 'pareto'}
    <ParetoChart {store} viewId="c" category={dimension} {measure} label="Pareto" />
  {:else if kind === 'diverging'}
    <DivergingBarChart {store} viewId="c" category={dimension} measure="margin" label="Marge par {dimension}" showLegend />
  {:else if kind === 'donut'}
    <DonutChart {store} viewId="c" category={dimension} {measure} centerLabel="Total" label="Répartition" />
  {:else if kind === 'funnel'}
    <FunnelChart {store} viewId="c" category="channel" {measure} showPercentages label="Entonnoir par canal" legend />
  {:else if kind === 'waterfall'}
    <WaterfallChart {store} viewId="c" category="category" {measure} totalLabel="Total" label="Cascade par catégorie" />
  {:else if kind === 'treemap'}
    <TreemapChart {store} viewId="c" hierarchy={['region', 'country', 'city']} {measure} label="Treemap géographique" />
  {:else if kind === 'sunburst'}
    <SunburstChart {store} viewId="c" hierarchy={['region', 'category', 'product']} {measure} label="Sunburst" legend />
  {:else if kind === 'sankey'}
    <SankeyChart {store} viewId="c" source="region" target="category" {measure} label="Flux région → catégorie" />
  {:else if kind === 'radar'}
    <RadarChart {store} viewId="c" axes={['Capteurs', 'Réseau', 'Contrôleurs', 'Énergie', 'Affichage']} series="category" {measure} label="Profil par catégorie" legend />
  {:else if kind === 'mekko'}
    <MekkoChart {store} viewId="c" category={dimension} series="channel" {measure} label="Marimekko" />
  {:else if kind === 'chord'}
    <ChordChart {store} viewId="c" source="region" target="channel" {measure} label="Chord région ↔ canal" />
  {:else if kind === 'rose'}
    <RoseChart {store} viewId="c" category={dimension} {measure} label="Rose polaire" />
  {:else if kind === 'packed'}
    <PackedBubbleChart {store} viewId="c" category={dimension} {measure} label="Bulles" />
  {:else if kind === 'histogram'}
    <HistogramChart {store} value="price" bins={16} label="Distribution des prix" />
  {:else if kind === 'box'}
    <BoxPlotChart {store} value="price" group="category" label="Prix par catégorie" />
  {:else if kind === 'heatmap'}
    <HeatmapChart {store} x="category" y="channel" {measure} label="Catégorie × canal" legend />
  {:else if kind === 'calendar'}
    <CalendarHeatmapChart {store} date="date" {measure} label="Activité par jour" />
  {:else if kind === 'bullet'}
    <BulletChart {store} value="revenue" target={1500000} category="Revenu" ranges={[800000, 1200000, 1600000]} label="Objectif de revenu" />
  {:else if kind === 'gauge'}
    <GaugeChart {store} value="revenue" min={0} max={2000000} label="Revenu" thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} unit="€" />
  {:else if kind === 'reference'}
    <ReferenceLineChart {store} viewId="c" measure="revenue" referenceLabel="Moyenne" label="Revenu par mois + ligne de référence" />
  {:else if kind === 'percentile'}
    <PercentileBandChart {store} viewId="c" value="price" lower={0.1} upper={0.9} label="Bande 10–90e percentile (prix)" />
  {:else if kind === 'trend'}
    <TrendLineChart {store} viewId="c" x="date" y="revenue" label="Tendance du revenu" />
  {:else if kind === 'forecast'}
    <ForecastLineChart {store} viewId="c" x="date" y="revenue" periods={6} label="Prévision du revenu (6 mois)" />
  {:else if kind === 'errorbars'}
    <ErrorBarsChart {store} viewId="c" category="category" value="price" interval="stdev" label="Prix moyen ± écart-type" />
  {:else if kind === 'cluster'}
    <AnalyticsClusterPlot {store} viewId="c" fields={['price', 'marginRate']} k={3} label="Clusters prix/marge" />
  {:else if kind === 'scatter'}
    <ScatterPlot {store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités par catégorie" />
  {:else if kind === 'candlestick'}
    <CandlestickChart store={ohlcStore} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers (28 séances)" />
  {:else if kind === 'sparkline'}
    <Sparkline {store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle du revenu" />
  {:else if kind === 'scorecard'}
    <ScoreCard {store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" label="Revenu total" tone="category1" />
  {/if}
</div>

<style>
  .ctrls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    margin-bottom: var(--st-spacing-4, 1rem);
  }
  .ctrl {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
  }
  .stage {
    min-height: 0;
  }
</style>
