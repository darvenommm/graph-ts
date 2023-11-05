import { Node } from '../node/node.js';
import { Edge } from '../edge/edge.js';
import { ErrorNotFoundNode, ErrorNotGaveEdges, ErrorGraphTransformToPrimitive } from './errors.js';

import type { INodeSettings } from '../node/types.js';
import type { IEdgeSettings } from '../edge/types.js';
import type { INodes, IConnections, IEdgesStatistics, IExtendedEdgesStatistics } from './types.js';

type TStructure = IConnections<IEdgesStatistics>;

// TODO check empty nodes
// TODO BFS, DFS
// TODO to yourself

export class Graph {
  #nodes: INodes = {};
  #structure: TStructure = {};

  constructor(
    nodesSettings: INodeSettings[],
    connectionsSettings: IConnections<IEdgeSettings | IEdgeSettings[]>,
  ) {
    this.#init(nodesSettings, connectionsSettings);
  }

  public show(): void {
    console.log(this.#getGraphInString());
  }

  #init(
    nodesSettings: INodeSettings[],
    connectionsSettings: IConnections<IEdgeSettings | IEdgeSettings[]>,
  ): void {
    this.#initNodes(nodesSettings);
    this.#initStructure(connectionsSettings);
  }

  #initNodes(nodesSettings: INodeSettings[]): void {
    for (const nodeSettings of nodesSettings) {
      const node = new Node(nodeSettings);
      const nodeName = node.name;

      this.#nodes[nodeName] = node;
      this.#structure[nodeName] = {};
    }
  }

  #initStructure(connectionsSettings: IConnections<IEdgeSettings | IEdgeSettings[]>): void {
    for (const [fromNodeName, connections] of Object.entries(connectionsSettings)) {
      this.#checkExistingNodeInNodes(fromNodeName);

      for (const [toNodeName, edgesSettings] of Object.entries(connections)) {
        this.#checkExistingNodeInNodes(toNodeName);
        const edgesStatistics = this.#getEdgesStatistics(edgesSettings);
        this.#setEdgesStatisticsForNodes(fromNodeName, toNodeName, edgesStatistics);
      }
    }
  }

  #getEdgesStatistics(edgesSettings: IEdgeSettings | IEdgeSettings[]): IExtendedEdgesStatistics {
    if (!Array.isArray(edgesSettings)) {
      edgesSettings = [edgesSettings];
    }

    if (edgesSettings.length === 0) {
      throw new ErrorNotGaveEdges();
    }

    let max: Edge = new Edge(edgesSettings[0]);
    let min: Edge = new Edge(edgesSettings[0]);
    let all: Edge[] = [];

    let bidirectionalEdges: Edge[] = [];
    let minBidirectional: Edge | null = null;
    let maxBidirectional: Edge | null = null;

    for (const edgeSettings of edgesSettings) {
      const edge = new Edge(edgeSettings);
      const weight = edge.weight;

      if (max.weight < weight) {
        max = edge;
      }

      if (min.weight > weight) {
        min = edge;
      }

      if (edge.isBidirectional) {
        bidirectionalEdges.push(edge);

        if (!minBidirectional || minBidirectional.weight > weight) {
          minBidirectional = edge;
        }

        if (!maxBidirectional || maxBidirectional.weight < weight) {
          maxBidirectional = edge;
        }
      }

      all.push(edge);
    }

    return { min, max, all, bidirectionalEdges, minBidirectional, maxBidirectional };
  }

  #setEdgesStatisticsForNodes(
    fromNodeName: string,
    toNodeName: string,
    edgesStatistics: IExtendedEdgesStatistics,
  ): void {
    const fromTo = this.#structure[fromNodeName][toNodeName] ?? {};
    const toFrom = this.#structure[toNodeName][fromNodeName] ?? {};
    const { min, max, all, minBidirectional, maxBidirectional, bidirectionalEdges } =
      edgesStatistics;

    this.#structure[fromNodeName][toNodeName] = {
      min: (fromTo.min?.weight ?? Infinity) > min.weight ? min : fromTo.min,
      max: (fromTo.max?.weight ?? -Infinity) > max.weight ? fromTo.max : max,
      all: [...(fromTo.all ?? []), ...all],
    };

    if (bidirectionalEdges.length > 0) {
      this.#structure[toNodeName][fromNodeName] = {
        min:
          (toFrom.min?.weight ?? Infinity) > minBidirectional!.weight
            ? minBidirectional!
            : toFrom.min,
        max:
          (toFrom.max?.weight ?? -Infinity) > maxBidirectional!.weight
            ? toFrom.max
            : maxBidirectional!,
        all: [...(toFrom.all ?? []), ...bidirectionalEdges],
      };
    }
  }

  #checkExistingNodeInNodes(nodeName: string): never | void {
    if (!this.#nodes[nodeName]) {
      throw new ErrorNotFoundNode();
    }
  }

  #getGraphInString(): string {
    let result = '';

    for (const [fromNodeName, connections] of Object.entries(this.#structure)) {
      result += `Node: ${fromNodeName}\n`;

      if (Object.entries(connections).length === 0) {
        result += '\tNo connections\n';
      }

      for (const [toNodeName, { min, max, all }] of Object.entries(connections)) {
        result += `\t Node: ${toNodeName} <-> Edge min: ${min.weight}, max: ${max.weight}, count: ${all.length}\n`;
      }

      result += '\n';
    }

    return result;
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | never {
    if (hint === 'number') {
      throw new ErrorGraphTransformToPrimitive();
    }

    return this.#getGraphInString();
  }
}
