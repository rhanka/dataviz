import {
  buildFlowModel,
  buildPartWholeHierarchy,
  buildPartWholeModel,
  buildRadarModel,
  buildWaterfallModel,
  findDimension,
  findMeasure,
  type DataModel,
  type FlowConfig,
  type FlowModel,
  type PartWholeConfig,
  type PartWholeHierarchyConfig,
  type PartWholeItem,
  type PartWholeModel,
  type PartWholeNode,
  type RadarConfig,
  type RadarModel,
  type Row,
  type WaterfallConfig,
  type WaterfallModel,
} from '@sentropic/dataviz-core';

const EMPTY_PART_WHOLE: PartWholeModel = { total: 0, items: [] };
const EMPTY_HIERARCHY: PartWholeNode = { key: 'root', label: 'Total', value: 0, children: [] };
const EMPTY_FLOW: FlowModel = { nodes: [], links: [] };
const EMPTY_RADAR: RadarModel = { axes: [], series: [] };
const EMPTY_WATERFALL: WaterfallModel = { total: 0, steps: [] };

export type HierarchyDatum = {
  label: string;
  value?: number;
  children?: HierarchyDatum[];
};

export type TreemapDatum = {
  label: string;
  value: number;
  children?: TreemapDatum[];
};

function hasDimensions(model: DataModel, ids: readonly string[]): boolean {
  return ids.every((id) => Boolean(findDimension(model, id)));
}

function hasMeasures(model: DataModel, ids: readonly string[]): boolean {
  return ids.every((id) => Boolean(findMeasure(model, id)));
}

export function buildSafePartWholeModel(
  model: DataModel,
  rows: readonly Row[],
  config: PartWholeConfig,
): PartWholeModel {
  if (!hasDimensions(model, [config.category]) || !hasMeasures(model, [config.measure])) {
    return EMPTY_PART_WHOLE;
  }
  return buildPartWholeModel(model, rows, config);
}

export function buildSafePartWholeHierarchy(
  model: DataModel,
  rows: readonly Row[],
  config: PartWholeHierarchyConfig,
): PartWholeNode {
  if (config.hierarchy.length === 0) return EMPTY_HIERARCHY;
  if (!hasDimensions(model, config.hierarchy) || !hasMeasures(model, [config.measure])) {
    return EMPTY_HIERARCHY;
  }
  return buildPartWholeHierarchy(model, rows, config);
}

export function buildSafeWaterfallModel(
  model: DataModel,
  rows: readonly Row[],
  config: WaterfallConfig,
): WaterfallModel {
  if (!hasDimensions(model, [config.category]) || !hasMeasures(model, [config.measure])) {
    return EMPTY_WATERFALL;
  }
  return buildWaterfallModel(model, rows, config);
}

export function buildSafeFlowModel(model: DataModel, rows: readonly Row[], config: FlowConfig): FlowModel {
  if (!hasDimensions(model, [config.source, config.target]) || !hasMeasures(model, [config.measure])) {
    return EMPTY_FLOW;
  }
  return buildFlowModel(model, rows, config);
}

export function buildSafeRadarModel(model: DataModel, rows: readonly Row[], config: RadarConfig): RadarModel {
  if (config.axes.length === 0) return EMPTY_RADAR;
  if (config.series !== undefined && !hasDimensions(model, [config.series])) return EMPTY_RADAR;
  if (!hasMeasures(model, config.axes)) return EMPTY_RADAR;
  return buildRadarModel(model, rows, config);
}

export function toPartWholeData(items: readonly PartWholeItem[]) {
  return items.map((item) => ({ label: item.label, value: item.value }));
}

export function toHierarchyDatum(node: PartWholeNode): HierarchyDatum {
  const children = node.children?.map(toHierarchyDatum);
  return children && children.length > 0
    ? { label: node.label, value: node.value, children }
    : { label: node.label, value: node.value };
}

function toTreemapDatum(node: PartWholeNode): TreemapDatum {
  const children = node.children?.map(toTreemapDatum);
  return children && children.length > 0
    ? { label: node.label, value: node.value ?? 0, children }
    : { label: node.label, value: node.value ?? 0 };
}

export function toTreemapData(node: PartWholeNode): TreemapDatum[] {
  return node.children?.map(toTreemapDatum) ?? [];
}

export function toWaterfallData(model: WaterfallModel) {
  return model.steps.map((step) =>
    step.kind === 'total'
      ? { label: step.label, value: step.end, type: 'total' as const }
      : {
          label: step.label,
          value: Math.abs(step.delta),
          type: step.delta < 0 ? ('decrease' as const) : ('increase' as const),
        },
  );
}

export function toRadarAxes(model: RadarModel): string[] {
  return model.axes.map((axis) => axis.label);
}

export function toRadarSeries(model: RadarModel) {
  return model.series.map((series) => ({
    label: series.label,
    values: series.points.map((point) => point.value),
  }));
}
