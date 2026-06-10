<!--
  Geo map demos. All seven dataviz geo wrappers render through the DS GeoMap
  surface, driven by the seeded (lat,lng) sales data. A measure switcher lets the
  reader weight points/flows by revenue, units or margin.
-->
<script lang="ts">
  import {
    GeoPointMap,
    ChoroplethMap,
    GeoFlowMap,
    GeoHexbinMap,
    GeoClusterMap,
    GeoDensityMap,
  } from '@sentropic/dataviz-svelte';
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  import { makeStore } from '../../data/store';

  let { kind, controls = true }: { kind: string; controls?: boolean } = $props();
  const store = makeStore();

  let measure = $state<'revenue' | 'units' | 'margin'>('revenue');
  const measureItems = [
    { value: 'revenue', label: 'Revenu (€)' },
    { value: 'units', label: 'Unités' },
    { value: 'margin', label: 'Marge (€)' },
  ];
</script>

{#if controls && kind !== 'flow'}
  <div class="ctrls">
    <div class="ctrl">
      <span>Mesure</span>
      <ContentSwitcher size="sm" label="Mesure" items={measureItems} value={measure} onchange={(v) => (measure = v as typeof measure)} />
    </div>
  </div>
{/if}

<div class="stage">
  {#if kind === 'point'}
    <GeoPointMap {store} viewId="g" latitude="lat" longitude="lng" labelField="city" value={measure} label="Ventes par ville" />
  {:else if kind === 'choropleth'}
    <ChoroplethMap {store} viewId="g" region="country" {measure} label="Revenu par pays" />
  {:else if kind === 'flow'}
    <GeoFlowMap {store} viewId="g" sourceLatitude="lat" sourceLongitude="lng" targetLatitude="lat" targetLongitude="lng" value="revenue" label="Flux logistiques" />
  {:else if kind === 'hexbin'}
    <GeoHexbinMap {store} viewId="g" latitude="lat" longitude="lng" value={measure} cellSize={28} label="Densité hexagonale" />
  {:else if kind === 'cluster'}
    <GeoClusterMap {store} viewId="g" latitude="lat" longitude="lng" value={measure} radius={40} label="Clustering de points" />
  {:else if kind === 'density'}
    <GeoDensityMap {store} viewId="g" latitude="lat" longitude="lng" value={measure} label="Carte de densité" />
  {/if}
</div>

<style>
  .ctrls { display: flex; gap: var(--st-spacing-4, 1rem); margin-bottom: var(--st-spacing-4, 1rem); }
  .ctrl { display: inline-flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; font-weight: 600; color: var(--st-semantic-text-secondary, #475569); }
</style>
