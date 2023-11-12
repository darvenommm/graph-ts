import { Graph } from './graphs/index.js';

const nodes = [];

const characters = 'ABCDEFGHIJKLMN';

for (const character of characters) {
  nodes.push({ name: character });
}

const connections = {
  A: {
    B: { weight: 7, isBidirectional: false },
    C: { weight: 3, isBidirectional: false },
    D: { weight: 4, isBidirectional: false },
  },
  B: {
    G: { weight: 8, isBidirectional: false },
  },
  C: {
    B: { weight: 12, isBidirectional: false },
    D: { weight: 5, isBidirectional: false },
    F: { weight: 2, isBidirectional: false },
  },
  E: {
    H: { weight: 8, isBidirectional: false },
  },
  F: {
    D: { weight: 10, isBidirectional: false },
  },
  G: {
    E: { weight: 3, isBidirectional: false },
    J: { weight: 5, isBidirectional: false },
  },
  H: {
    J: { weight: 1, isBidirectional: false },
    L: { weight: 8, isBidirectional: false },
  },
  I: {
    E: { weight: 3, isBidirectional: false },
  },
  J: {
    K: { weight: 2, isBidirectional: false },
    N: { weight: 3 },
  },
  K: {
    L: { weight: 1, isBidirectional: false },
  },
  L: {
    H: { weight: 7, isBidirectional: false },
    I: { weight: 22, isBidirectional: false },
    M: { weight: 17, isBidirectional: false },
  },
  N: {
    N: { weight: 1 },
  },
};

const graph = new Graph(nodes, connections);

console.log(graph.getMinSteps('D', 'A'));
