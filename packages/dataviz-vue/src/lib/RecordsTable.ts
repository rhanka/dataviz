import { defineComponent, h, type PropType } from 'vue';
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from '@sentropic/design-system-vue';
import { findMeasure, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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

/**
 * The underlying ("show records") rows for a view — the cross-filtered data
 * rendered as a design-system DataTable. Columns come from the data model.
 */
export const RecordsTable = defineComponent({
  name: 'RecordsTable',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    fields: { type: Array as PropType<string[]>, default: undefined },
    caption: { type: String, default: undefined },
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined },
    pageSize: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const ids = props.fields ?? [
        ...props.store.model.dimensions.map((d) => d.id),
        ...props.store.model.measures.map((m) => m.id),
      ];
      const columns: DataTableColumn[] = ids.map((id) => {
        const dim = props.store.model.dimensions.find((d) => d.id === id);
        const meas = findMeasure(props.store.model, id);
        return {
          key: id,
          label: dim?.label ?? meas?.label ?? id,
          sortable: true,
          align: meas ? 'end' : 'start',
        };
      });
      const rows: DataTableRow[] = props.store
        .applyCrossfilter(props.viewId)
        .map((row, i) => ({ ...row, id: String(i) }));
      return h(DataTable, {
        columns,
        rows,
        caption: props.caption,
        size: props.size,
        pageSize: props.pageSize,
        class: props.class,
      });
    };
  },
});
