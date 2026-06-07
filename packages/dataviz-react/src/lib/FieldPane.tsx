import {
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-react';
import {
  buildFieldPaneTree,
  type DataModel,
  type FieldId,
  type FieldPaneNode,
} from '@sentropic/dataviz-core';

export type FieldPaneProps = Omit<
  TreeViewProps,
  'nodes' | 'selectedId' | 'expandedIds' | 'defaultExpandedIds' | 'onSelect'
> & {
  model: DataModel;
  includeDimensions?: boolean;
  includeMeasures?: boolean;
  selectedId?: FieldId | string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  onSelect?: (id: FieldId | string) => void;
  label?: string;
};

const SELECTABLE_ROW_STYLE = {
  appearance: 'none',
  background: 'transparent',
  border: 0,
  color: 'inherit',
  font: 'inherit',
  padding: 0,
  textAlign: 'left',
  width: '100%',
} as const;

function InteractiveTreeRows({
  nodes,
  expanded,
  selectedId,
  onSelect,
}: {
  nodes: FieldPaneNode[];
  expanded: ReadonlySet<string>;
  selectedId?: FieldId | string;
  onSelect: (id: FieldId | string) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isExpanded = expanded.has(node.id);
        const rowClassName = [
          'st-treeView__row',
          node.id === selectedId && 'st-treeView__row--selected',
          node.disabled && 'st-treeView__row--disabled',
        ]
          .filter(Boolean)
          .join(' ');
        const rowChildren = (
          <>
            <span
              className={[
                'st-treeView__caret',
                !hasChildren && 'st-treeView__caret--leaf',
                isExpanded && 'st-treeView__caret--open',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              &#8250;
            </span>
            <span className="st-treeView__label">{node.label}</span>
          </>
        );

        return (
          <div key={node.id}>
            {node.field && !node.disabled ? (
              <button
                type="button"
                className={rowClassName}
                style={SELECTABLE_ROW_STYLE}
                role="treeitem"
                aria-selected={node.id === selectedId}
                onClick={() => onSelect(node.id)}
              >
                {rowChildren}
              </button>
            ) : (
              <div className={rowClassName} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
                {rowChildren}
              </div>
            )}
            {hasChildren && isExpanded ? (
              <InteractiveTreeRows nodes={node.children!} expanded={expanded} selectedId={selectedId} onSelect={onSelect} />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function FieldPane({
  model,
  includeDimensions,
  includeMeasures,
  selectedId,
  expandedIds,
  defaultExpandedIds,
  onSelect,
  label = 'Fields',
  ...rest
}: FieldPaneProps) {
  const tree = buildFieldPaneTree(model, { includeDimensions, includeMeasures });
  const { className, ...treeRest } = rest;

  if (onSelect) {
    const expanded = new Set(expandedIds ?? defaultExpandedIds ?? tree.defaultExpandedIds);
    return (
      <div
        {...treeRest}
        className={['st-treeView', className].filter(Boolean).join(' ') || undefined}
        role="tree"
        aria-label={treeRest['aria-label'] ?? label}
      >
        <InteractiveTreeRows nodes={tree.nodes} expanded={expanded} selectedId={selectedId} onSelect={onSelect} />
      </div>
    );
  }

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
