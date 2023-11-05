import { Graph } from './graphs/graph.js';

const nodes = [];

for (const character of 'ABCDEF') {
  nodes.push({ name: character });
}

const graph = new Graph(nodes, {
  A: {
    B: { weight: 13 },
    C: { weight: 7, isBidirectional: false },
  },
  B: {
    D: { weight: 12 },
  },
  D: {
    B: { weight: 10 },
    E: { weight: -7, isBidirectional: false },
  },
  E: {
    D: { weight: 7, isBidirectional: false },
    C: { weight: 3, isBidirectional: false },
  },
  F: {
    C: [
      { weight: 5, isBidirectional: false },
      { weight: 4, isBidirectional: false },
    ],
    F: [{ weight: 3 }, { weight: -2 }],
  },
});

const newGraph = graph.copy();

graph.addNodes({ name: 'hello' });

console.log(String(newGraph));
