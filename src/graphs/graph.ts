import deepcopy from 'deepcopy';

import { Node } from '../node/index.js';
import { Edge } from '../edge/index.js';
import { Deque } from '../deque/index.js';
import { ErrorNotFoundNode, ErrorNodeExist, ErrorGraphTransformToPrimitive } from './errors.js';

import type {
  INodes,
  TNodesSettings,
  TEdgeSettings,
  IConnections,
  IEdgesStatistics,
  TEdgesStatisticsWithEmptyValues,
  TExtendedEdgesStatistics,
  IGraph,
  TIterationCallback,
  IDfsBfsSettings,
} from './types.js';
import type { INodeSettings } from '../node/types';

// TODO BFS, DFS

export class Graph implements IGraph {
  private nodes: INodes = {};
  private structure: IConnections<IEdgesStatistics> = {};

  constructor(nodesSettings: TNodesSettings, connectionsSettings: IConnections) {
    this.initNodes(nodesSettings);
    this.initStructure(connectionsSettings);
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
      this.checkNotFoundingNode(nodeName);

      this.nodes[nodeName] = node;
      this.structure[nodeName] = {};
    }
  }

  public removeNodes(nodesSettings: TNodesSettings): void {
    if (!Array.isArray(nodesSettings)) {
      nodesSettings = [nodesSettings];
    }

    for (const nodeSettings of nodesSettings) {
      const node = new Node(nodeSettings);
      const nodeName = node.name;
      this.checkExistingNode(nodeName);

      delete this.nodes[nodeName];
      delete this.structure[nodeName];

      for (const [fromNodeName, connections] of Object.entries(this.structure)) {
        if (fromNodeName === nodeName) {
          continue;
        }

        delete connections[nodeName];
      }
    }
  }

  public addConnections(connectionsSettings: IConnections): void {
    for (const [fromNodeName, newConnections] of Object.entries(connectionsSettings)) {
      this.checkExistingNode(fromNodeName);

      for (const [toNodeName, edges] of Object.entries(newConnections)) {
        this.checkExistingNode(toNodeName);
        this.addNewEdgesStatisticsForNodes(fromNodeName, toNodeName, edges);
      }
    }
  }

  public removeAllConnections(fromNode: INodeSettings, toNode: INodeSettings): void {
    const fromNodeName = fromNode.name;
    const toNodeName = toNode.name;

    this.checkExistingNode(fromNodeName);
    this.checkExistingNode(fromNodeName);

    delete this.structure[fromNodeName][toNodeName];
    delete this.structure[toNodeName][fromNodeName];
  }

  public copy(): Graph {
    return Object.create(
      Object.getPrototypeOf(this),
      deepcopy(Object.getOwnPropertyDescriptors(this)),
    );
  }

  public dfs(
    startNodeName: string,
    callback: TIterationCallback,
    settings: IDfsBfsSettings = { isMutable: false },
  ): Graph {
    const graph = settings.isMutable ? this : this.copy();
    const visited: Record<string, boolean> = {};

    const stack = new Deque('stack');
    stack.add(startNodeName);

    while (!stack.isEmpty()) {
      const currentNodeName = stack.pop<string>();

      if (visited[currentNodeName]) {
        continue;
      } else {
        visited[currentNodeName] = true;
      }

      const { newValue = null, stop = false } = callback(new Node({ name: currentNodeName })) ?? {};

      if (stop) {
        break;
      }

      if (newValue !== null) {
        graph.nodes[currentNodeName].value = newValue;
      }

      for (const newNodeName of Object.keys(graph.structure[currentNodeName])) {
        if (!visited[newNodeName]) {
          stack.add(newNodeName);
        }
      }
    }

    return graph;
  }

  public bfs(
    startNodeName: string,
    callback: TIterationCallback,
    settings: IDfsBfsSettings,
  ): Graph {
    const graph = settings.isMutable ? this : this.copy();
    const visited: Record<string, boolean> = {};

    const stack = new Deque('queue');
    stack.add(startNodeName);

    while (!stack.isEmpty()) {
      const currentNodeName = stack.pop<string>();

      if (visited[currentNodeName]) {
        continue;
      } else {
        visited[currentNodeName] = true;
      }

      const { newValue = null, stop = false } = callback(new Node({ name: currentNodeName })) ?? {};

      if (stop) {
        break;
      }

      if (newValue !== null) {
        graph.nodes[currentNodeName].value = newValue;
      }

      for (const newNodeName of Object.keys(graph.structure[currentNodeName])) {
        if (!visited[newNodeName]) {
          stack.add(newNodeName);
        }
      }
    }

    return graph;
  }

  private initNodes(nodesSettings: TNodesSettings): void {
    if (!Array.isArray(nodesSettings)) {
      nodesSettings = [nodesSettings];
    }

    for (const nodeSettings of nodesSettings) {
      const node = new Node(nodeSettings);
      const nodeName = node.name;
      this.checkNotFoundingNode(nodeName);

      this.nodes[nodeName] = node;
      this.structure[nodeName] = {};
    }
  }

  private initStructure(connectionsSettings: IConnections): void {
    for (const [fromNodeName, connections] of Object.entries(connectionsSettings)) {
      this.checkExistingNode(fromNodeName);

      for (const [toNodeName, edgesSettings] of Object.entries(connections)) {
        this.checkExistingNode(toNodeName);
        this.addNewEdgesStatisticsForNodes(fromNodeName, toNodeName, edgesSettings);
      }
    }
  }

  private addNewEdgesStatisticsForNodes(
    fromNodeName: string,
    toNodeName: string,
    edgesStatistics: TEdgeSettings,
  ): void {
    const extendedEdgesStatistics = this.calculateEdgesStatistics(edgesStatistics);
    const { min, max, all } = extendedEdgesStatistics;
    const { minDouble, maxDouble, allDouble } = extendedEdgesStatistics;

    this.updateStatisticsForNodes(fromNodeName, toNodeName, { min, max, all });
    this.updateStatisticsForNodes(toNodeName, fromNodeName, {
      min: minDouble,
      max: maxDouble,
      all: allDouble,
    });
  }

  private getEdgesStatistics(
    fromNodeName: string,
    toNodeName: string,
  ): IEdgesStatistics | undefined {
    return this.structure[fromNodeName][toNodeName];
  }

  private calculateEdgesStatistics(edgesSettings: TEdgeSettings): TExtendedEdgesStatistics {
    const { all, allDouble } = this.getSingleAndDoubleEdges(edgesSettings);

    const { min, max } = this.getMinAndMaxEdge(all);
    const { min: minDouble, max: maxDouble } = this.getMinAndMaxEdge(allDouble);

    return { min, max, all, allDouble, minDouble, maxDouble };
  }

  private getSingleAndDoubleEdges(
    edgesSettings: TEdgeSettings,
  ): Pick<TExtendedEdgesStatistics, 'all' | 'allDouble'> {
    if (!Array.isArray(edgesSettings)) {
      edgesSettings = [edgesSettings];
    }

    const all: Edge[] = [];
    const allDouble: Edge[] = [];

    for (const edgeSettings of edgesSettings) {
      const edge = new Edge(edgeSettings);

      if (edge.isBidirectional) {
        allDouble.push(edge);
      }

      all.push(edge);
    }

    return { all, allDouble };
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
    fromNodeName: string,
    toNodeName: string,
    edgesStatistics: TEdgesStatisticsWithEmptyValues,
  ): void {
    const { min, max, all } = edgesStatistics;

    if (all.length === 0 || !max || !min) {
      return;
    }

    const fromToStatistics = this.getEdgesStatistics(fromNodeName, toNodeName);

    if (!fromToStatistics) {
      this.structure[fromNodeName][toNodeName] = { min, max, all };
      return;
    }

    this.structure[fromNodeName][toNodeName] = {
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

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | never {
    if (hint === 'number') {
      throw new ErrorGraphTransformToPrimitive();
    }

    return this.getGraphInString();
  }

  private checkNotFoundingNode(nodeName: string): never | void {
    if (this.nodes[nodeName]) {
      throw new ErrorNodeExist();
    }
  }

  private checkExistingNode(nodeName: string): never | void {
    if (!this.nodes[nodeName]) {
      throw new ErrorNotFoundNode();
    }
  }
}
