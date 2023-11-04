import { MatrixGraph } from './matrix-graph';
import { ListGraph } from './list-graph';

import type { INodeSettings } from '../node/node';
import type { IEdgeSettings } from '../edge/edge';
import type { IGraph, IConnections, IGraphConstructor } from './types';

interface IGraphSettings {
  implementationType: 'list' | 'matrix';
  nodesSettings: INodeSettings[];
  connectionsSettings: IConnections<IEdgeSettings[]>;
}

const DEFAULT_GRAPH_SETTINGS: IGraphSettings = {
  implementationType: 'list',
  nodesSettings: [],
  connectionsSettings: {},
};

type TGraphs = ListGraph | MatrixGraph;

function createGraph(
  implementation: IGraphConstructor<TGraphs>,
  nodesSettings: INodeSettings[],
  connectionsSettings: IConnections<IEdgeSettings[]>,
): IGraph {
  return new implementation(nodesSettings, connectionsSettings);
}

export class Graph implements IGraph {
  #graph: TGraphs;

  constructor(graphSettings: IGraphSettings = DEFAULT_GRAPH_SETTINGS) {
    const { implementationType, nodesSettings, connectionsSettings } = graphSettings;

    switch (implementationType) {
      case 'list':
        this.#graph = createGraph(ListGraph, nodesSettings, connectionsSettings);
        break;

      case 'matrix':
        this.#graph = createGraph(MatrixGraph, nodesSettings, connectionsSettings);
        break;
    }
  }

  public show(): void {
    this.#graph.show();
  }
}
