import {
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-react';
import {
  buildFieldPaneTree,
  type DataModel,
  type FieldId,
} from '@sentropic/dataviz-core';

export type FieldPaneProps = Omit<
  TreeViewProps,
  'nodes' | 'selectedId' | 'expandedIds' | 'defaultExpandedIds'
> & {
  model: DataModel;
  includeDimensions?: boolean;
  includeMeasures?: boolean;
  selectedId?: FieldId | string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  label?: string;
};

export function FieldPane({
  model,
  includeDimensions,
  includeMeasures,
  selectedId,
  expandedIds,
  defaultExpandedIds,
  label = 'Fields',
  ...rest
}: FieldPaneProps) {
  const tree = buildFieldPaneTree(model, { includeDimensions, includeMeasures });

  return (
    <TreeView
      {...rest}
      nodes={tree.nodes}
      selectedId={selectedId}
      expandedIds={expandedIds}
      defaultExpandedIds={defaultExpandedIds ?? tree.defaultExpandedIds}
      aria-label={rest['aria-label'] ?? label}
    />
  );
}
