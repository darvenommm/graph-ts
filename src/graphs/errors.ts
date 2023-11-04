export class ErrorNotFoundNode extends Error {
  message: string = 'The given node was not found in this graph!';
}

export class ErrorNotGaveEdges extends Error {
  message: string = 'The edges of two nodes not be given!';
}
