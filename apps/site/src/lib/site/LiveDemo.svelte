<!--
  Live demo host. Renders the registry's Svelte demo component (the REAL dataviz
  component bound to the seeded store). Charts read their colours from the active
  design-system palette tokens, so the global palette/dark switchers restyle the
  live demo instantly without remounting.
-->
<script lang="ts">
  import type { DemoEntry } from '../registry/types';

  let { entry }: { entry: DemoEntry } = $props();
  const Demo = $derived(entry.demo);
  const props = $derived(entry.demoProps ?? {});
</script>

<div class="dv-demo">
  {#key entry.slug}
    <Demo {...props} />
  {/key}
</div>
