import { Node } from '../node/node.js';
import { Edge, IEdgeSettings } from '../edge/edge.js';
import { ErrorNotFoundNode, ErrorNotGaveEdges } from './errors.js';

import type { INodeSettings } from '../node/node';
import type {
  IGraph,
  IConnections,
  IEdgesStatistics,
  INodes,
  IExtendedEdgesStatistics,
} from './types';

type TStructure = IConnections<IEdgesStatistics>;

export class ListGraph implements IGraph {
  #nodes: INodes = {};
  #structure: TStructure = {};

  constructor(nodesSettings: INodeSettings[], connectionsSettings: IConnections<IEdgeSettings[]>) {
    this.#init(nodesSettings, connectionsSettings);
  }

  public show(): void {
    for (const [fromNodeName, connections] of Object.entries(this.#structure)) {
      console.log(`Node: ${fromNodeName}`);

      if (Object.entries(connections).length === 0) {
        console.log('\tNo connections');
        continue;
      }

      for (const [toNodeName, { min, max }] of Object.entries(connections)) {
        console.log(
          `\t Node: ${toNodeName} -> Min Edge = ${min.weight} and Max Edge = ${max.weight}`,
        );
      }

      console.log('');
    }
  }

  #init(nodesSettings: INodeSettings[], connectionsSettings: IConnections<IEdgeSettings[]>): void {
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

  #initStructure(connectionsSettings: IConnections<IEdgeSettings[]>): void {
    for (const [fromNodeName, connections] of Object.entries(connectionsSettings)) {
      this.#checkExistingNodeInNodes(fromNodeName);

      for (const [toNodeName, edgesSettings] of Object.entries(connections)) {
        this.#checkExistingNodeInNodes(toNodeName);
        const edgesStatistics = this.#getEdgesStatistics(edgesSettings);
        this.#setEdgesStatisticsForNodes(fromNodeName, toNodeName, edgesStatistics);
      }
    }
  }

  #getEdgesStatistics(edgesSettings: IEdgeSettings[]): IExtendedEdgesStatistics {
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

        if (!maxBidirectional || maxBidirectional.weight > weight) {
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
            ? toFrom.min
            : minBidirectional!,
        all: [...(toFrom.all ?? []), ...bidirectionalEdges],
      };
    }
  }

  #checkExistingNodeInNodes(nodeName: string): never | void {
    if (!this.#nodes[nodeName]) {
      throw new ErrorNotFoundNode();
    }
  }
}

// const graph = new ListGraph(
//   [
//     {
//       name: 'A',
//     },
//     {
//       name: 'B',
//     },
//     {
//       name: 'C',
//     },
//     {
//       name: 'D',
//     },
//   ],
//   {
//     A: {
//       B: [
//         {
//           weight: 7,
//           isBidirectional: false,
//         },
//       ],
//       C: [
//         {
//           weight: 78,
//           isBidirectional: false,
//         },
//         {
//           weight: 80,
//         },
//         {
//           weight: 7,
//           isBidirectional: false,
//         },
//         {
//           weight: -17,
//         },
//       ],
//     },
//     B: {
//       C: [
//         {
//           weight: 8,
//           isBidirectional: false,
//         },
//       ],
//     },
//   },
// );

// graph.show();
