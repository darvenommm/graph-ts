import type { Node, INodeSettings } from '../node/node';
import type { Edge, IEdgeSettings } from '../edge/edge';

export interface INodes<T = Node> {
  [nodeName: string]: T;
}

export interface IConnections<T = Edge> {
  [fromNodeName: string]: {
    [toNodeName: string]: T;
  };
}

export interface IGraph {
  show(): void;
}

export interface IGraphConstructor<T> {
  new (nodes: INodeSettings[], connections: IConnections<IEdgeSettings[]>): T;
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
