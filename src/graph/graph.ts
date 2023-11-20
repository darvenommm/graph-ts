import deepcopy from 'deepcopy';

import { Node } from '../node/index';
import { Edge } from '../edge/index';
import { Deque } from '../deque/index';
import { ErrorNotFoundNode, ErrorNodeExist, ErrorGraphTransformToPrimitive } from './errors';

import type {
  INodes,
  TNodesSettings,
  TEdgeSettings,
  IConnections,
  IEdgesStatistics,
  TEdgesStatisticsWithEmptyValues,
  TExtendedEdgesStatistics,
  IGraph,
  IGraphSettings,
  TIterationCallback,
  IDfsBfsSettings,
} from './types';

export class Graph implements IGraph {
  private nodes: INodes;
  private structure: IConnections<IEdgesStatistics> = {};
  private settings: IGraphSettings;

  private calculatedDistances: Record<string, Record<string, number>> | null = null;

  constructor(
    nodesSettings: TNodesSettings,
    connectionsSettings: IConnections,
    graphSettings: Partial<Omit<IGraphSettings, 'isCalculated'>> = {},
  ) {
    this.settings = this.initGraphSettings(graphSettings);

    this.nodes = this.initNodes(nodesSettings);
    this.structure = this.initStructure(connectionsSettings);
  }

  public show(): void {
    console.log(this.getGraphInString());
  }

  public addNodes(nodesSettings: TNodesSettings): void {
    if (!Array.isArray(nodesSettings)) {
      nodesSettings = [nodesSettings];
    }

    for (const nodeSettings of nodesSettings) {
      const node = new Node(nodeSettings);
      const nodeName = node.name;
      this.checkNotFoundingNodes(nodeName);

      this.nodes[nodeName] = node;
      this.structure[nodeName] = {};
    }

    this.resetCalculatedDistances();
  }

  public removeNodes(nodesNames: string | string[]): void {
    if (!Array.isArray(nodesNames)) {
      nodesNames = [nodesNames];
    }

    for (const nodeName of nodesNames) {
      this.checkExistingNodes(nodeName);

      delete this.nodes[nodeName];
      delete this.structure[nodeName];

      for (const connections of Object.values(this.structure)) {
        delete connections[nodeName];
      }
    }

    this.resetCalculatedDistances();
  }

  public addConnections(connectionsSettings: IConnections): void {
    for (const [fromNodeName, newConnections] of Object.entries(connectionsSettings)) {
      this.checkExistingNodes(fromNodeName);

      for (const [toNodeName, edges] of Object.entries(newConnections)) {
        this.checkExistingNodes(toNodeName);
        this.addNewEdgesStatisticsForNodes(this.structure, fromNodeName, toNodeName, edges);
      }
    }

    this.resetCalculatedDistances();
  }

  public removeConnections(fromNodeName: string, toNodeName: string): void {
    this.checkExistingNodes([fromNodeName, toNodeName]);

    delete this.structure[fromNodeName][toNodeName];
    delete this.structure[toNodeName][fromNodeName];

    this.resetCalculatedDistances();
  }

  public copy(): Graph {
    return Object.create(
      Object.getPrototypeOf(this),
      deepcopy(Object.getOwnPropertyDescriptors(this)),
    );
  }

  public bfs(
    startNodeName: string,
    callback: TIterationCallback,
    settings?: IDfsBfsSettings,
  ): Graph {
    return this.goToNodes('bfs', startNodeName, callback, settings);
  }

  public dfs(
    startNodeName: string,
    callback: TIterationCallback,
    settings?: IDfsBfsSettings,
  ): Graph {
    return this.goToNodes('dfs', startNodeName, callback, settings);
  }

  public getMinSteps(fromNodeName: string, toNodeName: string): number {
    this.checkExistingNodes(fromNodeName);

    let result = -1;

    this.bfs(fromNodeName, (node, stepsCount) => {
      if (node.name === toNodeName) {
        result = stepsCount;

        return { stop: true };
      }
    });

    return result;
  }

  public getMinDistance(fromNodeName: string, toNodeName: string): number | null {
    this.checkExistingNodes([fromNodeName, toNodeName]);

    if (this.settings.isCalculated) {
      return this.calculatedDistances![fromNodeName][toNodeName];
    }

    if (this.settings.hasNegativeEdges) {
      return this.calculateDistanceUsingFordBellman(fromNodeName, toNodeName);
    }

    return this.getDistanceUsingDijkstra(fromNodeName, toNodeName);
  }

  public calculateAllDistances(): void {
    if (this.settings.isCalculated) {
      return;
    }

    this.calculateDistancesUsingFloydWarshall();
  }

  private goToNodes(
    typeOfGoing: 'dfs' | 'bfs',
    startNodeName: string,
    callback: TIterationCallback,
    settings: IDfsBfsSettings = { isMutable: false },
  ): Graph {
    this.checkExistingNodes(startNodeName);

    const graph = settings.isMutable ? this : this.copy();
    const visited: Record<string, boolean> = {};
    const steps: Record<string, number> = { [startNodeName]: 0 };

    const deque = new Deque<string>(typeOfGoing === 'bfs' ? 'stack' : 'queue');
    deque.add(startNodeName);

    while (!deque.isEmpty()) {
      const currentNodeName = deque.pop();

      if (visited[currentNodeName]) {
        continue;
      } else {
        visited[currentNodeName] = true;
      }

      const { stop = false } = callback(this.nodes[currentNodeName], steps[currentNodeName]) ?? {};

      if (stop) {
        break;
      }

      for (const closestNodeName of Object.keys(graph.structure[currentNodeName])) {
        if (visited[closestNodeName]) {
          continue;
        }

        if (!Number.isInteger(steps[closestNodeName])) {
          steps[closestNodeName] = steps[currentNodeName] + 1;
        }

        deque.add(closestNodeName);
      }
    }

    return graph;
  }

  private initGraphSettings(
    graphSettings: Partial<Omit<IGraphSettings, 'isCalculated'>>,
  ): IGraphSettings {
    return {
      hasNegativeEdges: graphSettings.hasNegativeEdges ?? false,
      isAcyclic: graphSettings.isAcyclic ?? false,
      isCalculated: false,
    };
  }

  private initNodes(nodesSettings: TNodesSettings): INodes {
    const nodes: INodes = {};

    if (!Array.isArray(nodesSettings)) {
      nodesSettings = [nodesSettings];
    }

    for (const nodeSettings of nodesSettings) {
      const node = new Node(nodeSettings);
      const nodeName = node.name;

      if (nodes[nodeName]) {
        throw new ErrorNodeExist();
      }

      nodes[nodeName] = node;
    }

    return nodes;
  }

  private initStructure(connectionsSettings: IConnections): IConnections<IEdgesStatistics> {
    const structure: IConnections<IEdgesStatistics> = {};

    for (const [fromNodeName, connections] of Object.entries(connectionsSettings)) {
      this.checkExistingNodes(fromNodeName);

      for (const [toNodeName, edgesSettings] of Object.entries(connections)) {
        this.checkExistingNodes(toNodeName);
        this.addNewEdgesStatisticsForNodes(structure, fromNodeName, toNodeName, edgesSettings);
      }
    }

    return structure;
  }

  private addNewEdgesStatisticsForNodes(
    structure: IConnections<IEdgesStatistics>,
    fromNodeName: string,
    toNodeName: string,
    edgesSettings: TEdgeSettings,
  ): void {
    const extendedEdgesStatistics = this.calculateEdgesStatistics(edgesSettings);
    const { min, max, all } = extendedEdgesStatistics;
    const { minBidirectional, maxBidirectional, allBidirectional } = extendedEdgesStatistics;

    this.updateStatisticsForNodes(structure, fromNodeName, toNodeName, { min, max, all });
    this.updateStatisticsForNodes(structure, toNodeName, fromNodeName, {
      min: minBidirectional,
      max: maxBidirectional,
      all: allBidirectional,
    });
  }

  private calculateEdgesStatistics(edgesSettings: TEdgeSettings): TExtendedEdgesStatistics {
    const { all, allBidirectional } = this.getSingleAndDoubleEdges(edgesSettings);

    const { min, max } = this.getMinAndMaxEdge(all);
    const { min: minBidirectional, max: maxBidirectional } =
      this.getMinAndMaxEdge(allBidirectional);

    return { min, max, all, allBidirectional, minBidirectional, maxBidirectional };
  }

  private getSingleAndDoubleEdges(
    edgesSettings: TEdgeSettings,
  ): Pick<TExtendedEdgesStatistics, 'all' | 'allBidirectional'> {
    if (!Array.isArray(edgesSettings)) {
      edgesSettings = [edgesSettings];
    }

    const all: Edge[] = [];
    const allBidirectional: Edge[] = [];

    for (const edgeSettings of edgesSettings) {
      const edge = new Edge(edgeSettings);

      if (edge.isBidirectional) {
        allBidirectional.push(edge);
      }

      all.push(edge);
    }

    return { all, allBidirectional };
  }

  private getMinAndMaxEdge(edges: Edge[]): Pick<TEdgesStatisticsWithEmptyValues, 'min' | 'max'> {
    if (edges.length === 0) {
      return { min: null, max: null };
    }

    let min = edges[0];
    let max = edges[0];

    for (const edge of edges) {
      if (edge < min) {
        min = edge;
      }

      if (edge > max) {
        max = edge;
      }
    }

    return { min, max };
  }

  private updateStatisticsForNodes(
    structure: IConnections<IEdgesStatistics>,
    fromNodeName: string,
    toNodeName: string,
    edgesStatistics: TEdgesStatisticsWithEmptyValues,
  ): void {
    const { min, max, all } = edgesStatistics;

    if (all.length === 0 || !max || !min) {
      return;
    }

    if (!structure[fromNodeName]) {
      structure[fromNodeName] = {};
    }

    if (!structure[toNodeName]) {
      structure[toNodeName] = {};
    }

    const fromToStatistics = structure[fromNodeName][toNodeName];

    if (!fromToStatistics) {
      structure[fromNodeName][toNodeName] = { min, max, all };
      return;
    }

    structure[fromNodeName][toNodeName] = {
      min: fromToStatistics.min > min ? min : fromToStatistics.min,
      max: fromToStatistics.max > max ? fromToStatistics.max : max,
      all: [...fromToStatistics.all, ...all],
    };
  }

  private getGraphInString(): string {
    let result = '';

    for (const [fromNodeName, connections] of Object.entries(this.structure)) {
      const fromNode = this.nodes[fromNodeName];
      result += `Node: ${fromNodeName}, Value: ${fromNode.value}\n`;

      if (Object.entries(connections).length === 0) {
        result += '\tNo connections\n';
      }

      for (const [toNodeName, { min, max, all }] of Object.entries(connections)) {
        const toNode = this.nodes[toNodeName];

        result += `\t Node: ${toNodeName}, Value: ${toNode.value} <-> Edge min: ${min.weight}, max: ${max.weight}, count: ${all.length}\n`;
      }

      result += '\n';
    }

    return result;
  }

  private getDistanceUsingDijkstra(fromNodeName: string, toNodeName: string): number {
    const calculatedDistance: Record<string, number> = {};
    const visited: Record<string, boolean> = {};

    for (const nodeName of Object.keys(this.nodes)) {
      calculatedDistance[nodeName] = Infinity;
    }

    calculatedDistance[fromNodeName] = this.structure[fromNodeName][fromNodeName]?.min.weight ?? 0;

    for (let i = 0; i < Object.keys(calculatedDistance).length; ++i) {
      const minNodeName = this.getNodeNameWithLowestDistance(calculatedDistance, visited);
      visited[minNodeName] = true;

      if (calculatedDistance[minNodeName] === Infinity) {
        break;
      }

      for (const [closestNode, edges] of Object.entries(this.structure[minNodeName])) {
        const new_distance: number = calculatedDistance[minNodeName] + edges.min.weight;

        if (new_distance < calculatedDistance[closestNode]) {
          calculatedDistance[closestNode] = new_distance;
        }
      }
    }

    return calculatedDistance[toNodeName];
  }

  private getNodeNameWithLowestDistance(
    distances: Record<string, number>,
    visited: Record<string, boolean>,
  ): string {
    let name: string = '';
    let min: number = Infinity;

    for (const [nodeName, distance] of Object.entries(distances)) {
      if (!visited[nodeName] && min >= distance) {
        min = distance;
        name = nodeName;
      }
    }

    if (name === '') {
      throw Error('The node name cannot be a empty string!');
    }

    return name;
  }

  private calculateDistancesUsingFloydWarshall(): void {
    const nodesNames = Object.keys(this.nodes);

    const calculatedDistances: Record<string, Record<string, number>> = {};
    for (const fromNodeName of nodesNames) {
      calculatedDistances[fromNodeName] = {};

      for (const toNodeName of nodesNames) {
        if (this.structure[fromNodeName][toNodeName]) {
          calculatedDistances[fromNodeName][toNodeName] =
            this.structure[fromNodeName][toNodeName].min.weight;
        } else if (fromNodeName === toNodeName) {
          calculatedDistances[fromNodeName][toNodeName] = 0;
        } else {
          calculatedDistances[fromNodeName][toNodeName] = Infinity;
        }
      }
    }

    for (const betweenNodeName of nodesNames) {
      for (const startNodeName of nodesNames) {
        if (calculatedDistances[startNodeName][betweenNodeName] === Infinity) {
          continue;
        }

        for (const endNodeName of nodesNames) {
          if (calculatedDistances[betweenNodeName][endNodeName] === Infinity) {
            continue;
          }

          const new_distance =
            calculatedDistances[startNodeName][betweenNodeName] +
            calculatedDistances[betweenNodeName][endNodeName];

          if (calculatedDistances[startNodeName][endNodeName] > new_distance) {
            calculatedDistances[startNodeName][endNodeName] = new_distance;
          }
        }
      }
    }

    this.calculatedDistances = calculatedDistances;
    this.settings.isCalculated = true;
  }

  private resetCalculatedDistances(): void {
    this.settings.isCalculated = false;
    this.calculatedDistances = null;
  }

  private calculateDistanceUsingFordBellman(
    fromNodeName: string,
    toNodeName: string,
  ): number | null {
    const distances: Record<string, number> = {};
    for (const nodeName of Object.keys(this.nodes)) {
      distances[nodeName] = Infinity;
    }
    distances[fromNodeName] = this.structure[fromNodeName][fromNodeName]?.min.weight ?? 0;

    while (true) {
      let wasUpdated = false;

      for (const [fromNodeName, distance] of Object.entries(distances)) {
        if (distance === Infinity) {
          continue;
        }

        for (const [toNodeName, edgesStatistics] of Object.entries(this.structure[fromNodeName])) {
          const newDistance = distances[fromNodeName] + edgesStatistics.min.weight;

          if (distances[toNodeName] > newDistance) {
            wasUpdated = true;
            distances[toNodeName] = newDistance;
          }
        }
      }

      if (!wasUpdated) {
        break;
      }
    }

    for (const [fromNodeName, distance] of Object.entries(distances)) {
      if (distance === Infinity) {
        continue;
      }

      for (const [toNodeName, edgesStatistics] of Object.entries(this.structure[fromNodeName])) {
        if (distances[toNodeName] > distances[fromNodeName] + edgesStatistics.min.weight) {
          return null;
        }
      }
    }

    return distances[toNodeName];
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | never {
    if (hint === 'number') {
      throw new ErrorGraphTransformToPrimitive();
    }

    return this.getGraphInString();
  }

  private checkNotFoundingNodes(nodeNames: string | string[]): never | void {
    if (!Array.isArray(nodeNames)) {
      nodeNames = [nodeNames];
    }

    for (const nodeName of nodeNames) {
      if (this.nodes[nodeName]) {
        throw new ErrorNodeExist();
      }
    }
  }

  private checkExistingNodes(nodeNames: string | string[]): never | void {
    if (!Array.isArray(nodeNames)) {
      nodeNames = [nodeNames];
    }

    for (const nodeName of nodeNames) {
      if (!this.nodes[nodeName]) {
        throw new ErrorNotFoundNode();
      }
    }
  }
}
