// nodes/index.js
// -----------------------------------------------------------------------------
// Export all node components for easy importing

import BaseNode from '@components/integration/nodes/BaseNode';
import SourceNode from '@components/integration/nodes/SourceNode';
import DestinationNode from '@components/integration/nodes/DestinationNode';
import TransformNode from '@components/integration/nodes/TransformNode';
import DatasetNode from '@components/integration/nodes/DatasetNode';
import TriggerNode from '@components/integration/nodes/TriggerNode';
import RouterNode from '@components/integration/nodes/RouterNode';
import ActionNode from '@components/integration/nodes/ActionNode';

// Node type to component mapping
const nodeTypes = {
  // Source nodes
  sourceNode: SourceNode,
  apiNode: SourceNode,
  fileNode: SourceNode,
  databaseNode: SourceNode,

  // Destination nodes
  destinationNode: DestinationNode,

  // Transform nodes
  transformNode: TransformNode,
  filterNode: TransformNode,
  mapNode: TransformNode,
  joinNode: TransformNode,
  aggregateNode: TransformNode,
  sortNode: TransformNode,

  // Dataset nodes
  datasetNode: DatasetNode,

  // Trigger nodes
  triggerNode: TriggerNode,
  scheduleNode: TriggerNode,
  webhookNode: TriggerNode,
  eventNode: TriggerNode,

  // Router nodes
  routerNode: RouterNode,
  forkNode: RouterNode,
  conditionNode: RouterNode,
  switchNode: RouterNode,
  mergeNode: RouterNode,

  // Action nodes
  actionNode: ActionNode,
  notificationNode: ActionNode,
  functionNode: ActionNode,
  delayNode: ActionNode,
  errorNode: ActionNode,
};

export {
  BaseNode,
  SourceNode,
  DestinationNode,
  TransformNode,
  DatasetNode,
  TriggerNode,
  RouterNode,
  ActionNode,
  nodeTypes,
};

export { default as ActionNode } from './ActionNode';
export { default as BaseNode } from './BaseNode';
export { default as DatasetNode } from './DatasetNode';
export { default as DestinationNode } from './DestinationNode';
export { default as OptimizedBaseNode } from './OptimizedBaseNode';
export { default as RouterNode } from './RouterNode';
export { default as SimplifiedNode } from './SimplifiedNode';
export { default as SourceNode } from './SourceNode';
export { default as StorageDestinationNode } from './StorageDestinationNode';
export { default as StorageSourceNode } from './StorageSourceNode';
export { default as TransformNode } from './TransformNode';
export { default as TriggerNode } from './TriggerNode';
