import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type DataTableProps,
} from '@sentropic/design-system-react';
import {
  buildPivotTable,
  type DashboardStore,
  type PivotConfig,
  type PivotTableRow,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type PivotDataTableProps = {
  store: DashboardStore;
  viewId?: string;
  rows: PivotConfig['rows'];
  columns?: PivotConfig['columns'];
  measures: PivotConfig['measures'];
  caption?: DataTableProps['caption'];
  size?: DataTableProps['size'];
  className?: string;
};

function toColumns(columns: ReturnType<typeof buildPivotTable>['columns']): DataTableColumn[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    sortable: true,
    align: column.kind === 'value' ? 'end' : 'start',
  }));
}

export function PivotDataTable({
  store,
  viewId,
  rows,
  columns,
  measures,
  caption,
  size,
  className,
}: PivotDataTableProps) {
  useDashboard(store);
  let table: { columns: DataTableColumn[]; rows: DataTableRow[] };
  try {
    const pivot = buildPivotTable(store.model, store.applyCrossfilter(viewId), {
      rows,
      columns,
      measures,
    });
    table = { columns: toColumns(pivot.columns), rows: pivot.rows as PivotTableRow[] };
  } catch {
    table = { columns: [], rows: [] };
  }

  return (
    <DataTable
      columns={table.columns}
      rows={table.rows}
      caption={caption}
      size={size}
      className={className}
    />
  );
}
