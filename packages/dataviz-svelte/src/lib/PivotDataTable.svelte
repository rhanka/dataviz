<script lang="ts" module>
  import type { DashboardStore, PivotConfig } from '@sentropic/dataviz-core';
  import type { DataTableColumn, DataTableRow } from '@sentropic/design-system-svelte';

  export type PivotDataTableProps = {
    store: DashboardStore;
    viewId?: string;
    rows: PivotConfig['rows'];
    columns?: PivotConfig['columns'];
    measures: PivotConfig['measures'];
    caption?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  };

  type TableView = {
    columns: DataTableColumn[];
    rows: DataTableRow[];
  };
</script>

<script lang="ts">
  import { DataTable } from '@sentropic/design-system-svelte';
  import { buildPivotTable } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    rows,
    columns,
    measures,
    caption,
    size,
    class: className,
  }: PivotDataTableProps = $props();

  const dash = $derived(useDashboard(store));
  const table = $derived.by((): TableView => {
    void $dash;
    try {
      const pivot = buildPivotTable(store.model, store.applyCrossfilter(viewId), {
        rows,
        columns,
        measures,
      });
      return {
        columns: pivot.columns.map((column) => ({
          key: column.key,
          label: column.label,
          sortable: true,
          align: column.kind === 'value' ? 'end' : 'start',
        })),
        rows: pivot.rows,
      };
    } catch {
      return { columns: [], rows: [] };
    }
  });
</script>

<DataTable columns={table.columns} rows={table.rows} {caption} {size} class={className} />
