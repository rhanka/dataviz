<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type RecordsTableProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This view's id in the cross-filter graph (rows shown are its visible rows). */
    viewId?: string;
    /** Field ids (and order) to show as columns; defaults to all model fields. */
    fields?: string[];
    caption?: string;
    size?: 'sm' | 'md' | 'lg';
    pageSize?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { DataTable, type DataTableColumn, type DataTableRow } from '@sentropic/design-system-svelte';
  import { findMeasure } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let { store, viewId, fields, caption, size, pageSize, class: className }: RecordsTableProps = $props();

  const dash = $derived(useDashboard(store));
  // The underlying ("show records") rows for this view: the cross-filtered data
  // rendered as a design-system DataTable. Columns come from the data model.
  const view = $derived.by((): { columns: DataTableColumn[]; rows: DataTableRow[] } => {
    void $dash;
    const ids = fields ?? [
      ...store.model.dimensions.map((d) => d.id),
      ...store.model.measures.map((m) => m.id),
    ];
    const columns: DataTableColumn[] = ids.map((id) => {
      const dim = store.model.dimensions.find((d) => d.id === id);
      const meas = findMeasure(store.model, id);
      return { key: id, label: dim?.label ?? meas?.label ?? id, sortable: true, align: meas ? 'end' : 'start' };
    });
    const rows: DataTableRow[] = store
      .applyCrossfilter(viewId)
      .map((row, i) => ({ ...row, id: String(i) }));
    return { columns, rows };
  });
</script>

<DataTable
  columns={view.columns}
  rows={view.rows}
  {caption}
  {size}
  {pageSize}
  class={className}
/>
