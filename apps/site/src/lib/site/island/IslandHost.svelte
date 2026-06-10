<!--
  React / Vue island host.

  Mirrors the design-system docs site's TabbedLiveExample island pattern: the
  control bar (measure / dimension switchers) stays Svelte, and the REAL
  dataviz-react / dataviz-vue components are mounted into a client-only host
  element via a dynamically-imported island, keyed by the active framework.

  - One fresh `DashboardStore` per host instance (isolated cross-filter state),
    rebuilt whenever the demo identity (section/kind) changes.
  - The mount/teardown `$effect` is keyed on the active framework, the resolved
    spec and the host element. It carries a `disposed` race guard (the mount is
    async) and unmounts the previous island in its cleanup — so switching
    framework, changing a control, or navigating away never leaks or
    double-mounts (the Vue teardown is additionally idempotent + defensive).
-->
<script lang="ts">
  import { browser } from '../env';
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  import { framework } from '../stores.svelte';
  import { makeStore } from '../../data/store';
  import type { Section } from '../../registry/types';
  import { buildSpec, type SpecContext } from './specs';
  import type { IslandHandle } from './react-island';

  let {
    section,
    kind,
    controls = true,
  }: { section: Section; kind: string; controls?: boolean } = $props();

  const active = $derived(framework.value);

  // Fresh store per (section, kind): isolated state, rebuilt when the demo
  // identity changes so navigating between demos can't share cross-filter state.
  const store = $derived.by(() => {
    // Touch the keys so the derived re-runs when the demo changes.
    void section;
    void kind;
    return makeStore();
  });

  // Control state, mirroring the Svelte ChartDemo / GeoDemo demos.
  let measure = $state<'revenue' | 'units' | 'margin'>('revenue');
  let dimension = $state<'category' | 'country' | 'channel' | 'segment'>('category');

  const measureItems = [
    { value: 'revenue', label: 'Revenu (€)' },
    { value: 'units', label: 'Unités' },
    { value: 'margin', label: 'Marge (€)' },
  ];
  const dimItems = [
    { value: 'category', label: 'Catégorie' },
    { value: 'country', label: 'Pays' },
    { value: 'channel', label: 'Canal' },
    { value: 'segment', label: 'Segment' },
  ];

  // Which controls a given chart kind reacts to (matches ChartDemo / GeoDemo).
  const isGeo = $derived(
    ['point', 'choropleth', 'flow', 'hexbin', 'cluster', 'density'].includes(kind),
  );
  const showDim = $derived(
    section === 'charts' &&
      !isGeo &&
      ['area', 'lollipop', 'step', 'pareto', 'diverging', 'donut', 'funnel', 'waterfall', 'rose', 'packed', 'stacked', 'mekko'].includes(kind),
  );
  const showMeasure = $derived(
    section === 'charts' &&
      (isGeo ? kind !== 'flow' : !['gauge', 'box', 'histogram'].includes(kind)),
  );

  const ctx = $derived<SpecContext>({ store, measure, dimension });
  const spec = $derived(buildSpec(section, kind, ctx));

  let islandHost = $state<HTMLDivElement | null>(null);

  // Mount / teardown the island, keyed on framework + resolved spec + host.
  $effect(() => {
    const fw = active;
    const host = islandHost;
    const nodes = spec;
    if (!browser || !host || fw === 'svelte' || !nodes) return;

    let handle: IslandHandle | null = null;
    let disposed = false;

    const mount = async () => {
      if (fw === 'react') {
        const { mountReactIsland } = await import('./react-island');
        if (disposed) return;
        handle = await mountReactIsland(host, nodes);
      } else if (fw === 'vue') {
        const { mountVueIsland } = await import('./vue-island');
        if (disposed) return;
        handle = await mountVueIsland(host, nodes);
      }
      if (disposed) handle?.unmount();
    };

    void mount();

    return () => {
      disposed = true;
      handle?.unmount();
      handle = null;
    };
  });
</script>

{#if controls && (showMeasure || showDim)}
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

{#if spec}
  <!-- Island host: filled client-side only by the active framework. -->
  <div class="stage" bind:this={islandHost}></div>
{:else}
  <p class="island-na">
    Aperçu live indisponible pour {active === 'react' ? 'React' : 'Vue'} sur ce
    composant — le code {active === 'react' ? 'React' : 'Vue'} ci-dessous reste exact.
    Repassez en Svelte pour la démo interactive.
  </p>
{/if}

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
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    min-height: 0;
  }
  .island-na {
    font-size: 0.85rem;
    color: var(--st-semantic-text-secondary, #475569);
    padding: 1rem;
    border: 1px dashed var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
  }
</style>
