import type { Node } from '../node/node';
import type { Edge } from '../edge/edge';
import type { INodeSettings } from '../node/types';
import type { IEdgeSettings } from '../edge/types';

export interface INodes<T = Node> {
  [nodeName: string]: T;
}

export type TNodesSettings = INodeSettings | INodeSettings[];

export type TEdgeSettings = IEdgeSettings | IEdgeSettings[];

export interface IConnections<T = IEdgeSettings | IEdgeSettings[]> {
  [fromNodeName: string]: {
    [toNodeName: string]: T;
  };
}

export interface IEdgesStatistics {
  min: Edge;
  max: Edge;
  all: Edge[];
}

export type TEdgesStatisticsWithEmptyValues<T = IEdgesStatistics> = {
  [Key in keyof T]: T[Key] extends Array<Edge> ? T[Key] | [] : T[Key] | null;
};

export type TExtendedEdgesStatistics = TEdgesStatisticsWithEmptyValues & {
  allDouble: Edge[] | [];
  maxDouble: Edge | null;
  minDouble: Edge | null;
};

export interface IGraph {
  show(): void;

  addNodes(nodesSettings: TNodesSettings): void;
  removeNodes(nodesSettings: TNodesSettings): void;

  addConnections(connectionsSettings: IConnections): void;
  removeAllConnections(fromNode: INodeSettings, toNode: INodeSettings): void;
}
