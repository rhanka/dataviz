<script lang="ts" module>
  import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';

  export type DonutChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measure: string;
    sort?: PartWholeSort;
    size?: number;
    thickness?: number;
    centerLabel?: string | null;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { DonutChart as DsDonutChart, type DonutChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

  let {
    store,
    viewId,
    category,
    measure,
    sort = 'input',
    size,
    thickness,
    centerLabel,
    label,
    class: className,
  }: DonutChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by((): DonutChartDatum[] => {
    void $dash;
    const model = buildSafePartWholeModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
    return toPartWholeData(model.items);
  });
</script>

<DsDonutChart {data} {label} {size} {thickness} {centerLabel} class={className} />
