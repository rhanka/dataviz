<!--
  Live demo host.

  - Svelte (default): renders the registry's hand-written Svelte demo component
    (the REAL dataviz-svelte component bound to a seeded store).
  - React / Vue: mounts the REAL dataviz-react / dataviz-vue component(s) for the
    same demo via a client-only island (IslandHost), driven by the same seeded
    store + props as the Svelte demo. Switching framework in the header switcher
    swaps the rendered framework; the previous island is torn down cleanly.

  Charts read their colours from the active design-system palette tokens, so the
  global palette / dark switchers restyle the live demo instantly without
  remounting.
-->
<script lang="ts">
  import type { DemoEntry } from '../registry/types';
  import { framework } from './stores.svelte';
  import { hasIsland } from './island/specs';
  import IslandHost from './island/IslandHost.svelte';

  let { entry }: { entry: DemoEntry } = $props();
  const Demo = $derived(entry.demo);
  const props = $derived(entry.demoProps ?? {});

  const kind = $derived(String((entry.demoProps?.kind as string) ?? ''));
  const fw = $derived(framework.value);
  // Render the island whenever a non-Svelte framework is active AND this demo
  // has a cross-framework spec; otherwise fall back to the Svelte demo.
  const useIsland = $derived(fw !== 'svelte' && hasIsland(entry.section, kind));
</script>

<div class="dv-demo">
  {#if useIsland}
    <!-- key on (slug, framework): fresh island host per demo + framework. -->
    {#key `${entry.slug}:${fw}`}
      <IslandHost section={entry.section} {kind} controls={entry.hasControls ?? true} />
    {/key}
  {:else}
    {#key entry.slug}
      <Demo {...props} />
    {/key}
  {/if}
</div>
