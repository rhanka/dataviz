import { defineComponent, h, type PropType } from 'vue';
import {
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-vue';
import {
  buildFieldPaneTree,
  type DataModel,
  type FieldId,
} from '@sentropic/dataviz-core';

export type FieldPaneProps = {
  model: DataModel;
  includeDimensions?: boolean;
  includeMeasures?: boolean;
  selectedId?: FieldId | string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  label?: string;
  class?: string;
};

export const FieldPane = defineComponent({
  name: 'FieldPane',
  props: {
    model: { type: Object as PropType<DataModel>, required: true },
    includeDimensions: { type: Boolean, default: undefined },
    includeMeasures: { type: Boolean, default: undefined },
    selectedId: { type: String as PropType<FieldId | string>, default: undefined },
    expandedIds: { type: Array as unknown as PropType<TreeViewProps['expandedIds']>, default: undefined },
    defaultExpandedIds: {
      type: Array as unknown as PropType<TreeViewProps['defaultExpandedIds']>,
      default: undefined,
    },
    label: { type: String, default: 'Fields' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const tree = buildFieldPaneTree(props.model, {
        includeDimensions: props.includeDimensions,
        includeMeasures: props.includeMeasures,
      });

      return h(TreeView, {
        nodes: tree.nodes,
        selectedId: props.selectedId,
        expandedIds: props.expandedIds,
        defaultExpandedIds: props.defaultExpandedIds ?? tree.defaultExpandedIds,
        class: props.class,
        'aria-label': props.label,
      });
    };
  },
});
