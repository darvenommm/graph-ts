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
  allDouble: Edge[] | [];
  maxDouble: Edge | null;
  minDouble: Edge | null;
};

export type TIterationCallback = (node: Node) => { newValue?: any; stop?: boolean } | void;

export interface IDfsBfsSettings {
  isMutable: boolean;
}

export interface IGraph {
  show(): void;

  addNodes(nodesSettings: TNodesSettings): void;
  removeNodes(nodesSettings: TNodesSettings): void;

  addConnections(connectionsSettings: IConnections): void;
  removeAllConnections(fromNode: INodeSettings, toNode: INodeSettings): void;

  copy(): Graph;

  bfs(startNodeName: string, callback: TIterationCallback, settings?: IDfsBfsSettings): Graph;
  dfs(startNodeName: string, callback: TIterationCallback, settings?: IDfsBfsSettings): Graph;
}
