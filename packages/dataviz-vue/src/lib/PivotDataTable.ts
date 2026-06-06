import { defineComponent, h, type PropType } from 'vue';
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from '@sentropic/design-system-vue';
import {
  buildPivotTable,
  type DashboardStore,
  type PivotConfig,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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

function toColumns(columns: ReturnType<typeof buildPivotTable>['columns']): DataTableColumn[] {
  return columns.map((column) => ({
    key: column.key,
    label: column.label,
    sortable: true,
    align: column.kind === 'value' ? 'end' : 'start',
  }));
}

export const PivotDataTable = defineComponent({
  name: 'PivotDataTable',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    rows: { type: Array as unknown as PropType<PivotConfig['rows']>, required: true },
    columns: { type: Array as unknown as PropType<PivotConfig['columns']>, default: undefined },
    measures: { type: Array as unknown as PropType<PivotConfig['measures']>, required: true },
    caption: { type: String, default: undefined },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      let columns: DataTableColumn[] = [];
      let rows: DataTableRow[] = [];
      try {
        const pivot = buildPivotTable(props.store.model, props.store.applyCrossfilter(props.viewId), {
          rows: props.rows,
          columns: props.columns,
          measures: props.measures,
        });
        columns = toColumns(pivot.columns);
        rows = pivot.rows as DataTableRow[];
      } catch {
        columns = [];
        rows = [];
      }
      return h(DataTable, {
        columns,
        rows,
        caption: props.caption,
        size: props.size,
        class: props.class,
      });
    };
  },
});
