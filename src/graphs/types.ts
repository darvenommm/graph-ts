import type { Node } from '../node/node';
import type { Edge } from '../edge/edge';

export interface INodes<T = Node> {
  [nodeName: string]: T;
}

export interface IConnections<T = Edge> {
  [fromNodeName: string]: {
    [toNodeName: string]: T;
  };
}

export interface IEdgesStatistics {
  min: Edge;
  max: Edge;
  all: Edge[];
  bidirectionalEdges?: never;
  maxBidirectional?: never;
  minBidirectional?: never;
}

export interface IExtendedEdgesStatistics {
  min: Edge;
  max: Edge;
  all: Edge[];
  bidirectionalEdges: Edge[];
  maxBidirectional: Edge | null;
  minBidirectional: Edge | null;
}
