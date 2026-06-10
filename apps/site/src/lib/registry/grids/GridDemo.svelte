<!--
  Grid demos (DataTable-based). Pivot / advanced-pivot / records all read the
  shared seeded store, so subtotals, heat cells and sparklines render against
  real multi-hundred-row data.
-->
<script lang="ts">
  import {
    PivotDataTable,
    AdvancedPivotDataTable,
    RecordsTable,
  } from '@sentropic/dataviz-svelte';
  import { makeStore } from '../../data/store';

  let { kind }: { kind: string; controls?: boolean } = $props();
  const store = makeStore();

  let collapsed = $state<string[]>([]);
</script>

<div class="stage">
  {#if kind === 'records'}
    <RecordsTable {store} pageSize={12} caption="Commandes (cross-filtrées)" />
  {:else if kind === 'pivot'}
    <PivotDataTable
      {store}
      rows={['region', 'country']}
      columns={['channel']}
      measures={['revenue']}
      caption="Revenu par région/pays × canal"
    />
  {:else if kind === 'advancedpivot'}
    <AdvancedPivotDataTable
      {store}
      rows={['region', 'category']}
      columns={['channel']}
      measures={['revenue', 'units']}
      includeSubtotals
      heatmap
      sparklineDimension="month"
      collapsedRowPaths={collapsed}
      onToggleRowPath={(id) =>
        (collapsed = collapsed.includes(id)
          ? collapsed.filter((c) => c !== id)
          : [...collapsed, id])}
      caption="Pivot avancé — sous-totaux, heat & sparkline"
    />
  {/if}
</div>

<style>
  .stage { display: flex; flex-direction: column; gap: var(--st-spacing-4, 1rem); }
</style>
