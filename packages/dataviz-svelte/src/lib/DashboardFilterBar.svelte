<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type DashboardFilterBarProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** Aria-label of the filter group. */
    label?: string;
    /** Label of the "clear all" button (design-system default otherwise). */
    clearAllLabel?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { FilterBar, FilterPill } from '@sentropic/design-system-svelte';
  import { findDimension, describeFilterSpec } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    label = 'Filtres actifs',
    clearAllLabel,
    class: className,
  }: DashboardFilterBarProps = $props();

  // `store` is read inside `$derived` (a reactive context) so the readable is
  // re-created if the prop changes; `$dash` auto-subscribes (SSR-safe).
  const dash = $derived(useDashboard(store));
  const entries = $derived(Object.entries($dash.filters));
</script>

<FilterBar
  {label}
  {clearAllLabel}
  class={className}
  onClearAll={entries.length > 0
    ? () => {
        for (const id of Object.keys($dash.filters)) store.clearFilter(id);
      }
    : undefined}
>
  {#each entries as [dimensionId, spec] (dimensionId)}
    {@const dimension = findDimension(store.model, dimensionId)}
    <FilterPill
      field={dimension?.label ?? dimensionId}
      value={describeFilterSpec(spec, dimension)}
      onRemove={() => store.clearFilter(dimensionId)}
    />
  {/each}
</FilterBar>
