import type { INodeSettings, Node } from '../node/index';
import type { IEdgeSettings, Edge } from '../edge/index';
import type { Graph } from './graph';

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
  allBidirectional: Edge[] | [];
  maxBidirectional: Edge | null;
  minBidirectional: Edge | null;
};

export type TIterationCallback = (node: Node, stepsCount: number) => { stop?: boolean } | void;

export interface IDfsBfsSettings {
  isMutable: boolean;
}

export interface IGraph {
  show(): void;

  addNodes(nodesSettings: TNodesSettings): void;
  removeNodes(nodeNames: string | string[]): void;

  addConnections(connectionsSettings: IConnections): void;
  removeConnections(fromNodeName: string, toNodeName: string): void;

  copy(): Graph;

  bfs(startNodeName: string, callback: TIterationCallback, settings?: IDfsBfsSettings): Graph;
  dfs(startNodeName: string, callback: TIterationCallback, settings?: IDfsBfsSettings): Graph;

  getMinSteps(fromNodeName: string, toNodeName: string): number;

  getMinDistance(fromNodeName: string, toNodeName: string): number | null;
  calculateAllDistances(): void;
}

export interface IGraphSettings {
  hasNegativeEdges: null | boolean;
}
