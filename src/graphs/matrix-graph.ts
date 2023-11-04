import { Node } from '../node/node.js';

import type { IEdgeSettings } from '../edge/edge';
import type { INodeSettings } from '../node/node';
import type { IConnections, IEdgesStatistics, IGraph } from './types';

type TStructure = Array<IEdgesStatistics[]>;

export class MatrixGraph implements IGraph {
  #nodes: Node[] = [];
  #structure: TStructure = {};

  constructor(nodesSettings: INodeSettings[], connectionsSettings: IConnections<IEdgeSettings[]>) {
    this.#init(nodesSettings);
  }

  public show(): void {}

  #init(nodesSettings: INodeSettings[]): void {
    this.#initNodes(nodesSettings);
  }

  #initNodes(nodesSettings: INodeSettings[]): void {
    for (const nodeSettings of nodesSettings) {
      const node = new Node(nodeSettings);

      this.#nodes.push(node);
    }
  }
}
