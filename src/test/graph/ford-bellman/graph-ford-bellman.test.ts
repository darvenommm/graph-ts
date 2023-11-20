import { Graph } from 'src/graph';
import { nodes, connections } from './mock';

const graph = new Graph(nodes, connections, { isAcyclic: false, hasNegativeEdges: true });

describe('Test ford-bellman algorithm', () => {
  test('A -> I', () => {
    expect(graph.getMinDistance('A', 'I')).toBe(45);
  });

  test('A -> C', () => {
    expect(graph.getMinDistance('A', 'C')).toBe(3);
  });

  test('H -> M', () => {
    expect(graph.getMinDistance('H', 'M')).toBe(21);
  });

  test('J -> D', () => {
    expect(graph.getMinDistance('J', 'D')).toBe(Infinity);
  });

  test('K -> N', () => {
    expect(graph.getMinDistance('K', 'N')).toBe(12);
  });

  test('N -> N', () => {
    expect(graph.getMinDistance('N', 'N')).toBe(1);
  });
});
